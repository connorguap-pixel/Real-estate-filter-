import React from 'react'
import { Link } from 'react-router-dom'

const STATE_RULES = {
  NJ: { redemptionPeriod: '10 days after sheriff sale', surplusDeadline: '6 months after foreclosure judgment', attorneyRequired: true, court: 'Superior Court — Chancery Division' },
  NY: { redemptionPeriod: 'None after judgment', surplusDeadline: '3 years from date of sale', attorneyRequired: true, court: 'Supreme Court' },
  FL: { redemptionPeriod: 'None — ends at sale', surplusDeadline: '60 days from certificate of disbursements', attorneyRequired: false, court: 'Circuit Court — Civil Division' },
  TX: { redemptionPeriod: '180 days (homestead/tax only)', surplusDeadline: '4 years from sale date', attorneyRequired: false, court: 'District Court (if disputed)' },
  CA: { redemptionPeriod: '3 months (judicial); none (non-judicial)', surplusDeadline: '1 year from trustee deed recordation', attorneyRequired: false, court: 'Superior Court (if disputed)' },
  PA: { redemptionPeriod: 'None after sheriff sale', surplusDeadline: '5 years', attorneyRequired: true, court: 'Court of Common Pleas' },
}

function fmt(n) {
  if (!n && n !== 0) return 'N/A'
  return '$' + Number(n).toLocaleString()
}

export default function ForeclosureAnalysis({ propertyData }) {
  const {
    preforeclosure, auctionDate, judgmentAmount, mortgageBalance,
    arv, state, bankruptcy, allLiens
  } = propertyData

  // Hard stop for bankruptcy
  if (bankruptcy) {
    return (
      <div className="w-full bg-red-900/50 border border-red-600 rounded-xl p-5">
        <p className="text-red-200 font-bold text-base text-center">
          ⛔ Automatic Stay Active — No Action Without Court Approval. Contact a bankruptcy attorney.
        </p>
      </div>
    )
  }

  // Days to auction
  let daysToAuction = null
  if (auctionDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const auction = new Date(auctionDate)
    auction.setHours(0, 0, 0, 0)
    daysToAuction = Math.round((auction - today) / (1000 * 60 * 60 * 24))
  }

  const arvNum = parseFloat(arv) || 0
  const judgmentNum = parseFloat(judgmentAmount) || 0
  const liensNum = parseFloat(allLiens) || 0
  const estimatedEquity = arvNum - judgmentNum - liensNum - (arvNum * 0.08)

  // Countdown color
  let countdownColor = 'text-green-400'
  let urgencyLabel = null
  if (daysToAuction !== null) {
    if (daysToAuction <= 7) { countdownColor = 'text-red-400'; urgencyLabel = 'URGENT — Act immediately' }
    else if (daysToAuction <= 14) { countdownColor = 'text-orange-400'; urgencyLabel = 'Time-sensitive' }
    else if (daysToAuction <= 30) { countdownColor = 'text-yellow-400' }
    else { countdownColor = 'text-green-400' }
  }

  // Verdict chips
  const verdicts = []
  if (preforeclosure && daysToAuction !== null && daysToAuction <= 14 && daysToAuction >= 0) {
    verdicts.push({ label: 'Contact Immediately', color: 'bg-green-600' })
  }
  if (preforeclosure && daysToAuction !== null && daysToAuction >= 15 && daysToAuction <= 60) {
    verdicts.push({ label: 'Watchlist', color: 'bg-yellow-600' })
  }
  if (daysToAuction !== null && daysToAuction < 0) {
    verdicts.push({ label: 'Too Risky', color: 'bg-red-600' })
  }
  if (estimatedEquity < 0) {
    verdicts.push({ label: 'Too Risky', color: 'bg-red-600' })
  }

  const stateRule = STATE_RULES[state?.toUpperCase()]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-5">
      <h3 className="text-white font-semibold text-sm">Foreclosure Analysis</h3>

      {/* Countdown */}
      <div className="bg-slate-900 rounded-lg p-4 text-center">
        {daysToAuction !== null ? (
          <>
            <div className={`text-5xl font-bold ${countdownColor}`}>{daysToAuction}</div>
            <div className="text-slate-400 text-sm mt-1">days to auction</div>
            {urgencyLabel && (
              <div className={`mt-2 text-xs font-bold uppercase tracking-wide ${countdownColor}`}>{urgencyLabel}</div>
            )}
          </>
        ) : (
          <div className="text-slate-400 text-sm">No auction date on record</div>
        )}
      </div>

      {/* Financial summary */}
      <div className="space-y-2">
        <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wide">Financial Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'Judgment Amount', val: fmt(judgmentAmount) },
            { label: 'Mortgage Balance', val: fmt(mortgageBalance) },
            { label: 'All Liens', val: fmt(allLiens) },
            { label: 'ARV', val: fmt(arv) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-slate-900 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-0.5">{label}</div>
              <div className="text-white font-semibold">{val}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs mb-0.5">Est. Equity at Sale (ARV − Judgment − Liens − 8% costs)</div>
            <div className={`font-bold text-lg ${estimatedEquity >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {estimatedEquity >= 0 ? '' : '-'}{fmt(Math.abs(estimatedEquity))}
            </div>
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded ${estimatedEquity >= 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {estimatedEquity >= 0 ? 'Positive' : 'Negative'}
          </div>
        </div>
      </div>

      {/* Verdict chips */}
      {verdicts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {verdicts.map((v, i) => (
            <span key={i} className={`${v.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>{v.label}</span>
          ))}
        </div>
      )}

      {/* State redemption period */}
      {stateRule && (
        <div className="bg-slate-900 rounded-lg p-3 text-sm">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{state?.toUpperCase()} Redemption Period</div>
          <div className="text-slate-200">{stateRule.redemptionPeriod}</div>
          <div className="text-slate-400 text-xs mt-1">{stateRule.court}</div>
        </div>
      )}
    </div>
  )
}
