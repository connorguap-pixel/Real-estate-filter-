import React from 'react'
import { Link } from 'react-router-dom'

export default function ProbateAnalysis({ propertyData }) {
  const { owner = '', ownershipYears, mailingAddress, address, vacant, taxDelinquency, county } = propertyData

  // Signal detection
  const ownerSuffix = /\b(Jr|Sr|II|III|Estate of|Heirs of)\b/i.test(owner)
  const longOwnership = (parseFloat(ownershipYears) || 0) >= 25
  const mailingMismatch = !!(mailingAddress && mailingAddress.trim() && mailingAddress.trim().toLowerCase() !== (address || '').trim().toLowerCase())
  const vacantAndDelinquent = !!(vacant && parseFloat(taxDelinquency) > 0)
  const estateKeyword = /\b(Estate|Trust)\b/i.test(owner)

  const signals = [
    { key: 'ownerSuffix', active: ownerSuffix, label: 'Owner name suggests deceased/estate' },
    { key: 'longOwnership', active: longOwnership, label: 'Long ownership (25+ years)' },
    { key: 'mailingMismatch', active: mailingMismatch, label: 'Mailing address mismatch' },
    { key: 'vacantAndDelinquent', active: vacantAndDelinquent, label: 'Vacant + tax delinquent' },
    { key: 'estateKeyword', active: estateKeyword, label: 'Estate/trust keyword in owner name' },
  ]

  const signalCount = signals.filter(s => s.active).length

  let verdictLabel = ''
  let verdictColor = ''
  if (signalCount >= 3) {
    verdictLabel = 'Strong Probate Lead'
    verdictColor = 'bg-green-600'
  } else if (signalCount >= 1) {
    verdictLabel = 'Possible Inherited Lead'
    verdictColor = 'bg-yellow-600'
  } else {
    verdictLabel = 'No Signal'
    verdictColor = 'bg-slate-600'
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Probate Analysis</h3>
        <span className={`${verdictColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>{verdictLabel}</span>
      </div>

      {/* Signal checklist */}
      <div className="space-y-2">
        {signals.map(({ key, active, label }) => (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className={`text-base ${active ? 'text-green-400' : 'text-slate-600'}`}>{active ? '✓' : '✗'}</span>
            <span className={active ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
          </div>
        ))}
      </div>

      {/* Recommended action for strong leads */}
      {signalCount >= 3 && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 space-y-1">
          <div className="text-blue-300 text-xs font-semibold uppercase tracking-wide">Recommended Action</div>
          <div className="text-slate-200 text-sm">
            Search "{owner} {county} probate records"
          </div>
          <div className="text-slate-400 text-xs">
            Web search triggered automatically when running full AI analysis.
          </div>
        </div>
      )}

      {/* Outreach link */}
      <div className="pt-1">
        <Link
          to="/outreach"
          className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
        >
          View Outreach Templates →
        </Link>
      </div>
    </div>
  )
}
