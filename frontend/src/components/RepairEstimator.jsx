import React, { useState, useEffect } from 'react'
import { REPAIR_ITEMS, calcRepairTotal } from '../lib/formulas.js'

export default function RepairEstimator({ sqft = 1200, baths = 2, windows = 10, onEstimateChange }) {
  const [selected, setSelected] = useState({})
  const [override, setOverride] = useState('')

  function toggleItem(key) {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }))
    setOverride('')
  }

  const selectedItems = REPAIR_ITEMS.filter(item => selected[item.key])
  const estimate = calcRepairTotal(selectedItems, sqft, baths, windows)

  useEffect(() => {
    const val = override ? parseFloat(override) : estimate.realistic
    onEstimateChange && onEstimateChange(val)
  }, [selected, override, sqft, baths])

  const fmt = (n) => '$' + Math.round(n).toLocaleString()

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {REPAIR_ITEMS.map(item => (
          <label key={item.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
            selected[item.key]
              ? 'bg-blue-900/30 border-blue-600 text-blue-200'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}>
            <input
              type="checkbox"
              className="accent-blue-500"
              checked={!!selected[item.key]}
              onChange={() => toggleItem(item.key)}
            />
            <span className="flex-1">{item.label}</span>
            <span className="text-xs text-slate-500">{fmt(item.low)}–{fmt(item.high)}</span>
          </label>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2">
        <p className="text-sm text-slate-300 font-medium">
          Estimated Repairs:{' '}
          <span className="text-yellow-400">{fmt(estimate.low)} – {fmt(estimate.high)}</span>
          <span className="text-slate-400 ml-2">(Realistic: <span className="text-white font-semibold">{fmt(estimate.realistic)}</span>)</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Manual override:</span>
          <input
            type="number"
            placeholder="Enter exact amount"
            value={override}
            onChange={e => setOverride(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white text-sm rounded px-2 py-1 w-40 focus:outline-none focus:border-blue-500"
          />
          {override && (
            <span className="text-xs text-green-400">Using: {fmt(parseFloat(override))}</span>
          )}
        </div>
      </div>
    </div>
  )
}
