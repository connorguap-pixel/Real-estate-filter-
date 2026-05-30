import React, { useState } from 'react'
import { ArrowUpDown, Download } from 'lucide-react'

function rowColor(combined) {
  if (combined >= 140) return 'bg-green-900/20 hover:bg-green-900/30 border-l-2 border-green-600'
  if (combined >= 90) return 'bg-yellow-900/20 hover:bg-yellow-900/30 border-l-2 border-yellow-600'
  return 'bg-slate-800/50 hover:bg-slate-800 opacity-70 border-l-2 border-slate-700'
}

export default function BatchLeadTable({ leads = [], onSelectLead }) {
  const [sortKey, setSortKey] = useState('combined')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...leads].sort((a, b) => {
    const av = a[sortKey] || 0, bv = b[sortKey] || 0
    return sortDir === 'asc' ? av - bv : bv - av
  })

  function exportCSV() {
    const headers = ['address', 'city', 'state', 'zip', 'distressScore', 'equityScore', 'combined', 'tier', 'topStrategy', 'topFlags']
    const rows = leads.map(l => headers.map(h => {
      const v = h === 'topFlags' ? (l.topFlags || []).join('|') : (l[h] || '')
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    }).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'scored-leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const SortHeader = ({ k, label }) => (
    <th
      className="px-3 py-2 text-left text-xs text-slate-400 font-semibold cursor-pointer hover:text-white transition-colors whitespace-nowrap"
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={11} /></span>
    </th>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{leads.length} leads scored</p>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors"
        >
          <Download size={13} />
          Export Scored List
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <SortHeader k="address" label="Address" />
              <SortHeader k="distressScore" label="Distress" />
              <SortHeader k="equityScore" label="Equity" />
              <SortHeader k="combined" label="Combined" />
              <th className="px-3 py-2 text-left text-xs text-slate-400 font-semibold">Flags</th>
              <th className="px-3 py-2 text-left text-xs text-slate-400 font-semibold">Strategy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sorted.map((lead, i) => (
              <tr
                key={i}
                className={`cursor-pointer transition-all ${rowColor(lead.combined || 0)}`}
                onClick={() => onSelectLead && onSelectLead(lead)}
              >
                <td className="px-3 py-2.5">
                  <div className="text-white font-medium text-xs">{lead.address || '—'}</div>
                  <div className="text-slate-500 text-xs">{lead.city} {lead.state} {lead.zip}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`font-bold ${(lead.distressScore || 0) >= 70 ? 'text-green-400' : (lead.distressScore || 0) >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {lead.distressScore || 0}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`font-bold ${(lead.equityScore || 0) >= 70 ? 'text-green-400' : (lead.equityScore || 0) >= 40 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {lead.equityScore || 0}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`font-bold text-sm ${(lead.combined || 0) >= 140 ? 'text-green-400' : (lead.combined || 0) >= 90 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {lead.combined || 0}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(lead.topFlags || []).slice(0, 3).map(f => (
                      <span key={f} className="px-1.5 py-0.5 bg-red-900/40 text-red-400 text-xs rounded">{f}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-300">{lead.topStrategy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-sm">No leads to display</div>
        )}
      </div>
    </div>
  )
}
