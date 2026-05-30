import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter, Download, Tag, X, ChevronDown } from 'lucide-react'
import AuctionCountdown from '../components/AuctionCountdown.jsx'

const LEAD_STAGES = ['cold', 'warm', 'hot', 'offer_sent', 'under_contract', 'closed', 'dead']
const FOLLOW_UP_STATUSES = ['new', 'contacted', 'negotiating', 'follow_up', 'pass']

function PropertyModal({ property, onClose, onUpdate }) {
  const [notes, setNotes] = useState(property.notes || '')
  const [leadStage, setLeadStage] = useState(property.leadStage || 'cold')
  const [followUpStatus, setFollowUpStatus] = useState(property.followUpStatus || 'new')
  const [newOffer, setNewOffer] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await axios.put(`/api/properties/${property.id}`, { notes, leadStage, followUpStatus })
      onUpdate(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function addOffer() {
    if (!newOffer) return
    const offerHistory = [...(property.offerHistory || []), { amount: parseFloat(newOffer), date: new Date().toISOString(), status: 'sent' }]
    try {
      const res = await axios.put(`/api/properties/${property.id}`, { offerHistory })
      onUpdate(res.data)
      setNewOffer('')
    } catch (err) {
      console.error(err)
    }
  }

  const analysis = property.analysisJson || {}

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div>
            <h2 className="text-white font-semibold">{property.address}</h2>
            <p className="text-slate-400 text-xs">{property.city}, {property.state} {property.zip}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{property.distressScore}</div>
              <div className="text-xs text-slate-400">Distress</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{property.equityScore}</div>
              <div className="text-xs text-slate-400">Equity</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 text-center">
              <div className="text-xs font-semibold text-green-400">{property.finalVerdict?.substring(0, 20)}</div>
              <div className="text-xs text-slate-400">Verdict</div>
            </div>
          </div>

          {/* Stage and status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lead Stage</label>
              <select value={leadStage} onChange={e => setLeadStage(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none capitalize">
                {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Follow-up Status</label>
              <select value={followUpStatus} onChange={e => setFollowUpStatus(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none capitalize">
                {FOLLOW_UP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {/* Offer history */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">Offer History</label>
            {(property.offerHistory || []).map((offer, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2 mb-1">
                <span className="text-white text-sm font-semibold">${offer.amount?.toLocaleString()}</span>
                <span className="text-slate-500 text-xs">{new Date(offer.date).toLocaleDateString()}</span>
                <span className="text-xs text-blue-400 capitalize">{offer.status}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input type="number" value={newOffer} onChange={e => setNewOffer(e.target.value)} placeholder="Offer amount" className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none" />
              <button onClick={addOffer} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Add</button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-slate-700">
          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CRM() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ verdict: '', leadStage: '', followUpStatus: '' })
  const [sort, setSort] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [selectedProp, setSelectedProp] = useState(null)

  async function fetchProperties() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filters.verdict) params.set('verdict', filters.verdict)
      if (filters.leadStage) params.set('leadStage', filters.leadStage)
      if (filters.followUpStatus) params.set('followUpStatus', filters.followUpStatus)
      params.set('sort', sort)
      params.set('order', order)
      const res = await axios.get(`/api/properties?${params}`)
      setProperties(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProperties() }, [search, filters, sort, order])

  function exportCSV() { window.open('/api/properties/export/csv', '_blank') }

  function updateProperty(updated) {
    setProperties(prev => prev.map(p => p.id === updated.id ? updated : p))
    setSelectedProp(updated)
  }

  const verdictColor = (v = '') => {
    const lower = v.toLowerCase()
    if (lower.includes('strong') || lower.includes('good')) return 'text-green-400'
    if (lower.includes('pass') || lower.includes('dead')) return 'text-red-400'
    return 'text-yellow-400'
  }

  const selectCls = 'bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500'

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">CRM — Lead Manager</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search address, owner, city, ZIP..." className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={filters.leadStage} onChange={e => setFilters(p => ({ ...p, leadStage: e.target.value }))} className={selectCls}>
            <option value="">All Stages</option>
            {LEAD_STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={filters.followUpStatus} onChange={e => setFilters(p => ({ ...p, followUpStatus: e.target.value }))} className={selectCls}>
            <option value="">All Follow-ups</option>
            {FOLLOW_UP_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className={selectCls}>
            <option value="createdAt">Sort: Date Added</option>
            <option value="distressScore">Sort: Distress</option>
            <option value="equityScore">Sort: Equity</option>
            <option value="auctionDate">Sort: Auction Date</option>
          </select>
          <button onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
            {order === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>

      <p className="text-slate-500 text-sm">{properties.length} properties</p>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Address</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Scores</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Verdict</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Stage</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Auction</th>
                  <th className="px-4 py-3 text-left text-xs text-slate-400 font-semibold">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {properties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/30 cursor-pointer transition-colors" onClick={() => setSelectedProp(p)}>
                    <td className="px-4 py-3">
                      <div className="text-white text-xs font-medium">{p.address}</div>
                      <div className="text-slate-500 text-xs">{p.city}, {p.state} {p.zip}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div><span className="text-blue-400 font-bold">{p.distressScore}</span> <span className="text-slate-600">distress</span></div>
                      <div><span className="text-purple-400 font-bold">{p.equityScore}</span> <span className="text-slate-600">equity</span></div>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${verdictColor(p.finalVerdict)}`}>{p.finalVerdict?.substring(0, 25)}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full capitalize">{p.leadStage}</span></td>
                    <td className="px-4 py-3">{p.auctionDate ? <AuctionCountdown auctionDate={p.auctionDate} /> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-blue-900/40 text-blue-400 text-xs rounded">{tag}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {properties.length === 0 && (
              <div className="py-16 text-center text-slate-500">No properties match your filters.</div>
            )}
          </div>
        </div>
      )}

      {selectedProp && (
        <PropertyModal property={selectedProp} onClose={() => setSelectedProp(null)} onUpdate={updateProperty} />
      )}
    </div>
  )
}
