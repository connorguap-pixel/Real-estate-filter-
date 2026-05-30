import React from 'react'
import { detectRedFlags } from '../lib/redFlags.js'
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react'

export default function RedFlagBadges({ property, analysis }) {
  const { hardBlockers, dealKillers, cautions } = detectRedFlags(property, analysis)
  const hasAny = hardBlockers.length > 0 || dealKillers.length > 0 || cautions.length > 0

  if (!hasAny) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Info size={14} />
        <span>No red flags detected</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {property.bankruptcy && (
        <div className="w-full bg-red-900/50 border border-red-600 rounded-lg p-3 text-center">
          <p className="text-red-400 font-bold text-base">⛔ Automatic Stay Active — No Action Without Court Approval.</p>
          <p className="text-red-300 text-sm mt-1">Contact a bankruptcy attorney before taking any steps on this property.</p>
        </div>
      )}

      {hardBlockers.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mb-1.5">
            <AlertOctagon size={13} />
            HARD BLOCKERS
          </div>
          <div className="flex flex-wrap gap-2">
            {hardBlockers.map(flag => (
              <span key={flag} className="px-2.5 py-1 bg-red-900/50 border border-red-600 text-red-300 text-xs font-semibold rounded-full">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {dealKillers.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold mb-1.5">
            <AlertTriangle size={13} />
            DEAL KILLERS
          </div>
          <div className="flex flex-wrap gap-2">
            {dealKillers.map(flag => (
              <span key={flag} className="px-2.5 py-1 bg-orange-900/40 border border-orange-600 text-orange-300 text-xs font-semibold rounded-full">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {cautions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold mb-1.5">
            <Info size={13} />
            CAUTIONS
          </div>
          <div className="flex flex-wrap gap-2">
            {cautions.map(flag => (
              <span key={flag} className="px-2.5 py-1 bg-yellow-900/30 border border-yellow-600 text-yellow-300 text-xs font-medium rounded-full">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
