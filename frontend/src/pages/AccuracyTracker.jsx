import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const fmt = (n) => '$' + Math.abs(Math.round(n || 0)).toLocaleString()
const pctFmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return 'N/A'
  return (n >= 0 ? '+' : '') + (n * 100).toFixed(1) + '%'
}

export default function AccuracyTracker() {
  const [properties, setProperties] = useState([])
  const [closedDeals, setClosedDeals] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [actualForm, setActualForm] = useState({ purchasePrice: '', repairs: '', salePrice: '', profit: '' })
  const [saving, setSaving] = useState(false)
  const [biasCorrection, setBiasCorrection] = useState(() => localStorage.getItem('bias_correction') === '1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/properties')
        setProperties(res.data)
        setClosedDeals(res.data.filter(p => p.actualNumbers && Object.keys(p.actualNumbers).length > 0))
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  function toggleBiasCorrection() {
    const newVal = !biasCorrection
    setBiasCorrection(newVal)
    localStorage.setItem('bias_correction', newVal ? '1' : '0')
  }

  function setField(k, v) { setActualForm(prev => ({ ...prev, [k]: v })) }

  async function handleSave() {
    if (!selectedId) return
    setSaving(true)
    try {
      const actual = {
        purchasePrice: parseFloat(actualForm.purchasePrice) || 0,
        repairs: parseFloat(actualForm.repairs) || 0,
        salePrice: parseFloat(actualForm.salePrice) || 0,
        profit: parseFloat(actualForm.profit) || 0,
        recordedAt: new Date().toISOString()
      }
      const res = await axios.put(`/api/properties/${selectedId}`, { actualNumbers: actual, leadStage: 'closed' })
      const updated = res.data
      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p))
      setClosedDeals(prev => {
        const existing = prev.find(p => p.id === updated.id)
        return existing ? prev.map(p => p.id === updated.id ? updated : p) : [...prev, updated]
      })
      setActualForm({ purchasePrice: '', repairs: '', salePrice: '', profit: '' })
      setSelectedId('')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Calculate bias
  let arvBias = null, repairBias = null
  if (closedDeals.length >= 5) {
    const arvDeviations = closedDeals
      .filter(d => d.arv && d.actualNumbers?.salePrice)
      .map(d => (d.actualNumbers.salePrice - d.arv) / d.arv)
    const repairDeviations = closedDeals
      .filter(d => d.repairEstimate && d.actualNumbers?.repairs)
      .map(d => (d.actualNumbers.repairs - d.repairEstimate) / d.repairEstimate)
    if (arvDeviations.length > 0) arvBias = arvDeviations.reduce((s, v) => s + v, 0) / arvDeviations.length
    if (repairDeviations.length > 0) repairBias = repairDeviations.reduce((s, v) => s + v, 0) / repairDeviations.length
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600'

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <BarChart3 size={22} className="text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Accuracy Tracker</h1>
          <p className="text-slate-400 text-sm">Compare estimated vs actual numbers to improve your analysis</p>
        </div>
      </div>

      {/* Bias report */}
      {closedDeals.length >= 5 && (
        <div className="bg-slate-800 border border-yellow-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <span className="text-white font-semibold text-sm">Your Bias Report ({closedDeals.length} closed deals)</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-9 h-5 rounded-full relative transition-colors ${biasCorrection ? 'bg-blue-600' : 'bg-slate-700'}`} onClick={toggleBiasCorrection}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${biasCorrection ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-slate-300">Apply bias correction</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">ARV Accuracy</div>
              {arvBias !== null ? (
                <div className={`font-semibold flex items-center gap-1 ${arvBias >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {arvBias >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  You {arvBias >= 0 ? 'underestimate' : 'overestimate'} ARV by {Math.abs(arvBias * 100).toFixed(1)}%
                </div>
              ) : <div className="text-slate-500 text-xs">Not enough data</div>}
            </div>
            <div className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Repair Accuracy</div>
              {repairBias !== null ? (
                <div className={`font-semibold flex items-center gap-1 ${repairBias <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {repairBias <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                  You {repairBias <= 0 ? 'overestimate' : 'underestimate'} repairs by {Math.abs(repairBias * 100).toFixed(1)}%
                </div>
              ) : <div className="text-slate-500 text-xs">Not enough data</div>}
            </div>
          </div>
          {biasCorrection && <p className="text-xs text-blue-400">Bias correction is ON — analysis calculations will be adjusted on the Analyze page</p>}
        </div>
      )}

      {/* Log actual numbers */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm">Log Actual Close Numbers</h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Select Property</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none">
            <option value="">Choose a property...</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.address} — {p.city}, {p.state}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Actual Purchase Price ($)</label>
            <input type="number" value={actualForm.purchasePrice} onChange={e => setField('purchasePrice', e.target.value)} placeholder="185000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Actual Repair Cost ($)</label>
            <input type="number" value={actualForm.repairs} onChange={e => setField('repairs', e.target.value)} placeholder="32000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Actual Sale/Assign Price ($)</label>
            <input type="number" value={actualForm.salePrice} onChange={e => setField('salePrice', e.target.value)} placeholder="270000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Net Profit ($)</label>
            <input type="number" value={actualForm.profit} onChange={e => setField('profit', e.target.value)} placeholder="28000" className={inputCls} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || !selectedId} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Actual Numbers'}
        </button>
      </div>

      {/* Comparison table */}
      {closedDeals.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-white font-semibold text-sm">Estimated vs Actual ({closedDeals.length} deals)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Property</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Est. ARV</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Actual Sale</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">ARV Δ</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Est. Repairs</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Actual Repairs</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Repair Δ</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {closedDeals.map(deal => {
                  const actual = deal.actualNumbers || {}
                  const arvDelta = deal.arv && actual.salePrice ? (actual.salePrice - deal.arv) / deal.arv : null
                  const repairDelta = deal.repairEstimate && actual.repairs ? (actual.repairs - deal.repairEstimate) / deal.repairEstimate : null
                  return (
                    <tr key={deal.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white text-xs font-medium">{deal.address}</div>
                        <div className="text-slate-500 text-xs">{deal.city}, {deal.state}</div>
                      </td>
                      <td className="px-4 py-3 text-white text-xs">{deal.arv ? fmt(deal.arv) : '—'}</td>
                      <td className="px-4 py-3 text-white text-xs">{actual.salePrice ? fmt(actual.salePrice) : '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {arvDelta !== null ? (
                          <span className={arvDelta >= 0 ? 'text-green-400' : 'text-red-400'}>{pctFmt(arvDelta)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-white text-xs">{deal.repairEstimate ? fmt(deal.repairEstimate) : '—'}</td>
                      <td className="px-4 py-3 text-white text-xs">{actual.repairs ? fmt(actual.repairs) : '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {repairDelta !== null ? (
                          <span className={repairDelta <= 0 ? 'text-green-400' : 'text-red-400'}>{pctFmt(repairDelta)}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {actual.profit ? (
                          <span className={actual.profit >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{fmt(actual.profit)}</span>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {closedDeals.length < 5 && closedDeals.length > 0 && (
        <p className="text-slate-500 text-sm text-center">Log {5 - closedDeals.length} more closed deals to unlock your bias report.</p>
      )}
    </div>
  )
}
