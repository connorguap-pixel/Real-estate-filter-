import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import axios from 'axios'
import AuctionCountdown from '../components/AuctionCountdown.jsx'

const COLUMNS = [
  { id: 'prospecting', label: 'Prospecting', color: 'border-slate-600' },
  { id: 'contacted', label: 'Contacted', color: 'border-blue-600' },
  { id: 'negotiating', label: 'Negotiating', color: 'border-yellow-600' },
  { id: 'under_contract', label: 'Under Contract', color: 'border-orange-500' },
  { id: 'due_diligence', label: 'Due Diligence', color: 'border-purple-600' },
  { id: 'closed', label: 'Closed', color: 'border-green-600' },
  { id: 'dead', label: 'Dead', color: 'border-red-700' },
]

const COLUMN_STAGE_MAP = {
  prospecting: 'cold',
  contacted: 'warm',
  negotiating: 'warm',
  under_contract: 'hot',
  due_diligence: 'hot',
  closed: 'closed',
  dead: 'dead'
}

function daysSince(dateStr) {
  return Math.floor((new Date() - new Date(dateStr)) / 86400000)
}

export default function Pipeline() {
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await axios.get('/api/properties')
      const grouped = {}
      COLUMNS.forEach(c => { grouped[c.id] = [] })

      res.data.forEach(p => {
        const stage = p.followUpStatus || 'prospecting'
        const col = COLUMNS.find(c => c.id === stage) ? stage : 'prospecting'
        grouped[col].push(p)
      })
      setItems(grouped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function onDragEnd(result) {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCol = [...(items[source.droppableId] || [])]
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...(items[destination.droppableId] || [])]

    const [moved] = sourceCol.splice(source.index, 1)
    destCol.splice(destination.index, 0, moved)

    setItems(prev => ({
      ...prev,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destination.droppableId === source.droppableId ? sourceCol : destCol
    }))

    // Update in backend
    try {
      await axios.put(`/api/properties/${draggableId}`, {
        followUpStatus: destination.droppableId,
        leadStage: COLUMN_STAGE_MAP[destination.droppableId] || 'cold'
      })
    } catch (err) {
      console.error('Failed to update stage:', err)
      fetchData()
    }
  }

  const totalCards = Object.values(items).reduce((s, arr) => s + arr.length, 0)

  return (
    <div className="p-6 space-y-5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-slate-400 text-sm">{totalCards} properties — drag to update stage</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading pipeline...</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(col => (
              <div key={col.id} className="shrink-0 w-64">
                <div className={`flex items-center justify-between mb-2 pb-2 border-b-2 ${col.color}`}>
                  <span className="text-white text-sm font-semibold">{col.label}</span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {(items[col.id] || []).length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-24 rounded-xl p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-700/50' : 'bg-slate-900/20'}`}
                    >
                      {(items[col.id] || []).map((prop, index) => (
                        <Draggable key={prop.id} draggableId={prop.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-slate-800 border border-slate-700 rounded-xl p-3 mb-2 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging ? 'shadow-xl rotate-1 border-blue-600' : 'hover:border-slate-600'}`}
                            >
                              <div className="text-white text-xs font-semibold leading-snug mb-1">{prop.address}</div>
                              <div className="text-slate-500 text-xs mb-2">{prop.city}, {prop.state}</div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-blue-400 text-xs font-bold">{prop.distressScore}</span>
                                <span className="text-xs text-slate-600">D</span>
                                <span className="text-purple-400 text-xs font-bold">{prop.equityScore}</span>
                                <span className="text-xs text-slate-600">E</span>
                              </div>
                              {prop.primaryStrategy && (
                                <div className="text-xs text-slate-400 mb-1.5">{prop.primaryStrategy}</div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600">{daysSince(prop.updatedAt)}d in stage</span>
                                {prop.auctionDate && <AuctionCountdown auctionDate={prop.auctionDate} />}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
