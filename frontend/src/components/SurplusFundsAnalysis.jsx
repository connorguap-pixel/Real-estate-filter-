import React from 'react'

const STATE_RULES = {
  NJ: { redemptionPeriod: '10 days after sheriff sale', surplusDeadline: '6 months after foreclosure judgment', attorneyRequired: true, court: 'Superior Court — Chancery Division' },
  NY: { redemptionPeriod: 'None after judgment', surplusDeadline: '3 years from date of sale', attorneyRequired: true, court: 'Supreme Court' },
  FL: { redemptionPeriod: 'None — ends at sale', surplusDeadline: '60 days from certificate of disbursements', attorneyRequired: false, court: 'Circuit Court — Civil Division' },
  TX: { redemptionPeriod: '180 days (homestead/tax only)', surplusDeadline: '4 years from sale date', attorneyRequired: false, court: 'District Court (if disputed)' },
  CA: { redemptionPeriod: '3 months (judicial); none (non-judicial)', surplusDeadline: '1 year from trustee deed recordation', attorneyRequired: false, court: 'Superior Court (if disputed)' },
  PA: { redemptionPeriod: 'None after sheriff sale', surplusDeadline: '5 years', attorneyRequired: true, court: 'Court of Common Pleas' },
}

function fmt(n) {
  return '$' + Math.abs(Number(n)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function SurplusFundsAnalysis({ propertyData }) {
  const { finalSalePrice, judgmentAmount, allLiens, state } = propertyData

  const saleNum = parseFloat(finalSalePrice) || 0
  const judgmentNum = parseFloat(judgmentAmount) || 0
  const liensNum = parseFloat(allLiens) || 0
  const costs = saleNum * 0.12
  const surplus = saleNum - judgmentNum - liensNum - costs

  const noData = !finalSalePrice || saleNum === 0

  let verdictLabel = ''
  let verdictColor = ''
  if (noData) {
    verdictLabel = 'Verify Records'
    verdictColor = 'bg-yellow-600'
  } else if (surplus > 15000) {
    verdictLabel = 'Strong Opportunity'
    verdictColor = 'bg-green-600'
  } else if (surplus >= 5000) {
    verdictLabel = 'Possible'
    verdictColor = 'bg-yellow-600'
  } else {
    verdictLabel = 'No Obvious Surplus'
    verdictColor = 'bg-red-600'
  }

  const stateRule = STATE_RULES[state?.toUpperCase()]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Surplus Funds Analysis</h3>
        <span className={`${verdictColor} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}>{verdictLabel}</span>
      </div>

      {/* Formula breakdown table */}
      <div className="bg-slate-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2.5 text-slate-300">Final Sale Price</td>
              <td className="px-4 py-2.5 text-right text-white font-medium">{fmt(saleNum)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2.5 text-slate-400">Minus Judgment</td>
              <td className="px-4 py-2.5 text-right text-red-400">−{fmt(judgmentNum)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2.5 text-slate-400">Minus All Liens</td>
              <td className="px-4 py-2.5 text-right text-red-400">−{fmt(liensNum)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="px-4 py-2.5 text-slate-400">Minus Est. Costs (12%)</td>
              <td className="px-4 py-2.5 text-right text-red-400">−{fmt(costs)}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-white font-bold">Potential Surplus</td>
              <td className={`px-4 py-3 text-right font-bold text-lg ${surplus > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {surplus < 0 ? '−' : ''}{fmt(surplus)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* State-specific rules */}
      {stateRule && (
        <div className="bg-slate-900 rounded-lg p-4 space-y-2 text-sm">
          <div className="text-slate-300 font-semibold text-xs uppercase tracking-wide">{state?.toUpperCase()} Surplus Rules</div>
          {stateRule.attorneyRequired && (
            <div className="text-yellow-300 text-xs font-semibold">⚠️ Attorney Required in {state?.toUpperCase()}</div>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="text-slate-400">Claim Deadline: <span className="text-slate-200">{stateRule.surplusDeadline}</span></div>
            <div className="text-slate-400">Court: <span className="text-slate-200">{stateRule.court}</span></div>
          </div>
        </div>
      )}

      {/* Legal disclaimer */}
      <p className="text-xs text-slate-500 italic">
        Surplus fund recovery may require licensed attorney representation depending on state law.
      </p>
    </div>
  )
}
