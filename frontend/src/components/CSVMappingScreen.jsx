import React, { useState } from 'react'
import { Save, CheckCircle } from 'lucide-react'
import { SYSTEM_FIELDS } from '../lib/csvMapper.js'

export default function CSVMappingScreen({ csvHeaders = [], autoMappings = {}, onConfirm, onSave }) {
  const [mappings, setMappings] = useState(autoMappings)
  const [profileName, setProfileName] = useState('')
  const [saved, setSaved] = useState(false)

  function setMapping(header, value) {
    setMappings(prev => ({ ...prev, [header]: value }))
  }

  function handleSave() {
    if (profileName && onSave) {
      onSave(profileName, mappings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const unmappedCount = csvHeaders.filter(h => !mappings[h] || mappings[h] === '(skip)').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">Map CSV Columns</h3>
          <p className="text-sm text-slate-400">{csvHeaders.length} columns detected. {unmappedCount > 0 && <span className="text-yellow-400">{unmappedCount} unmapped.</span>}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Profile name..."
            value={profileName}
            onChange={e => setProfileName(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 w-40"
          />
          <button
            onClick={handleSave}
            disabled={!profileName}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg font-medium transition-all ${
              saved ? 'bg-green-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
            }`}
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">CSV Column</th>
              <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Maps To System Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {csvHeaders.map(header => {
              const mapped = mappings[header]
              const isUnmapped = !mapped || mapped === '(skip)'
              return (
                <tr key={header} className={isUnmapped ? 'bg-yellow-900/10' : ''}>
                  <td className="px-4 py-2.5">
                    <span className={`font-mono text-sm ${isUnmapped ? 'text-yellow-400' : 'text-white'}`}>{header}</span>
                    {isUnmapped && <span className="ml-2 text-xs text-yellow-600">unmapped</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={mappings[header] || '(skip)'}
                      onChange={e => setMapping(header, e.target.value)}
                      className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 min-w-40"
                    >
                      {SYSTEM_FIELDS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => onConfirm && onConfirm(mappings)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Confirm Mapping & Score Leads
      </button>
    </div>
  )
}
