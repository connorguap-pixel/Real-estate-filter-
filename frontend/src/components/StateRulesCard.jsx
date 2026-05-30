import React from 'react'
import { Scale, AlertTriangle } from 'lucide-react'

const STATE_RULES = {
  NJ: {
    name: 'New Jersey',
    foreclosureType: 'Judicial',
    redemptionPeriod: '10 days after sheriff sale (none after deed transfer)',
    surplusDeadline: '6 months after foreclosure judgment',
    attorneyRequired: true,
    requiredDocs: ['Verified claim petition', 'Proof of interest (deed, mortgage)', 'Court filing fee'],
    court: 'Superior Court — Chancery Division',
    notes: 'NJ is a judicial foreclosure state — process averages 3–4 years. Surplus funds held by county sheriff.',
    flag: '⚠️ Judicial State — Long timeline. Sheriff sale surplus must be claimed within 6 months.',
  },
  NY: {
    name: 'New York',
    foreclosureType: 'Judicial',
    redemptionPeriod: 'None after judgment (right of redemption waived at sale)',
    surplusDeadline: '3 years from date of sale',
    attorneyRequired: true,
    requiredDocs: ['Motion to surplus funds', 'Proof of interest', 'Referee\'s report', 'Court order'],
    court: 'Supreme Court — foreclosure department',
    notes: 'NY judicial foreclosures average 2–3+ years. Surplus held by county clerk.',
    flag: '⚠️ Judicial State — extremely long timeline. Surplus claim requires attorney motion.',
  },
  FL: {
    name: 'Florida',
    foreclosureType: 'Judicial',
    redemptionPeriod: 'None — right of redemption ends at sale',
    surplusDeadline: '60 days from clerk\'s filing of certificate of disbursements',
    attorneyRequired: false,
    requiredDocs: ['Claim form (pro se allowed)', 'Proof of ownership interest', 'Government-issued ID'],
    court: 'Circuit Court — Civil Division',
    notes: 'FL surplus claims are relatively accessible without an attorney. Clerk of court holds funds.',
    flag: null,
  },
  TX: {
    name: 'Texas',
    foreclosureType: 'Non-Judicial (Deed of Trust)',
    redemptionPeriod: '180 days for homestead (tax foreclosures only); none for mortgage',
    surplusDeadline: '4 years from sale date',
    attorneyRequired: false,
    requiredDocs: ['Written claim to trustee or county', 'Proof of interest', 'Identification'],
    court: 'District Court (if disputed)',
    notes: 'TX non-judicial foreclosures move fast — typically 21–45 days after notice. Surplus paid by trustee.',
    flag: '🔴 Non-Judicial — foreclosure can happen in weeks. Act fast on pre-foreclosure leads.',
  },
  CA: {
    name: 'California',
    foreclosureType: 'Non-Judicial (Trustee Sale) — primary; Judicial available',
    redemptionPeriod: '3 months (judicial); none (non-judicial trustee sale)',
    surplusDeadline: '1 year from trustee\'s deed recordation',
    attorneyRequired: false,
    requiredDocs: ['Written demand to trustee within 30 days', 'Proof of interest', 'Priority claim documentation'],
    court: 'Superior Court (if disputed)',
    notes: 'CA trustee sales are fast (~120 days from NOD). Surplus claimed directly from trustee first.',
    flag: '⚠️ Non-Judicial state — trustee sale surplus must be demanded within 30 days of sale.',
  },
  PA: {
    name: 'Pennsylvania',
    foreclosureType: 'Judicial',
    redemptionPeriod: 'None after sheriff sale (buyer gets deed immediately)',
    surplusDeadline: '5 years',
    attorneyRequired: true,
    requiredDocs: ['Petition to court', 'Proof of lien/ownership interest', 'Priority documentation'],
    court: 'Court of Common Pleas',
    notes: 'PA sheriff sales move relatively quickly for judicial (6–12 months). Surplus held by sheriff.',
    flag: null,
  },
}

export default function StateRulesCard({ state, analysisType = 'both' }) {
  const rules = STATE_RULES[state?.toUpperCase()]
  if (!rules) return null

  return (
    <div className="bg-slate-800 border border-purple-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-purple-400" />
          <span className="text-white font-semibold text-sm">State Rules — {rules.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          rules.foreclosureType.startsWith('Judicial')
            ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
            : 'bg-red-900/50 text-red-400 border border-red-700'
        }`}>
          {rules.foreclosureType.split('—')[0].split('(')[0].trim()}
        </span>
      </div>

      {rules.flag && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-3 py-2 text-yellow-300 text-xs flex items-start gap-2">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          {rules.flag}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 text-xs">
        {(analysisType === 'foreclosure' || analysisType === 'both') && (
          <>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Foreclosure Type</span>
              <span className="text-white text-right">{rules.foreclosureType}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Redemption Period</span>
              <span className="text-white text-right max-w-xs">{rules.redemptionPeriod}</span>
            </div>
          </>
        )}
        {(analysisType === 'surplus' || analysisType === 'both') && (
          <>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Surplus Claim Deadline</span>
              <span className="text-white text-right">{rules.surplusDeadline}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Attorney Required</span>
              <span className={`font-semibold ${rules.attorneyRequired ? 'text-red-400' : 'text-green-400'}`}>
                {rules.attorneyRequired ? 'YES — Required' : 'No (pro se allowed)'}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-400">Court / Filing Body</span>
              <span className="text-white text-right">{rules.court}</span>
            </div>
          </>
        )}
      </div>

      {(analysisType === 'surplus' || analysisType === 'both') && (
        <div>
          <div className="text-xs text-slate-400 mb-1">Required Documents</div>
          <ul className="space-y-0.5">
            {rules.requiredDocs.map((doc, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-purple-400 mt-0.5">•</span>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rules.notes && (
        <div className="text-xs text-slate-500 italic border-t border-slate-700 pt-2">{rules.notes}</div>
      )}

      {rules.attorneyRequired && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-xs text-red-300">
          ⚠️ <strong>Attorney Required:</strong> Surplus fund recovery in {rules.name} may require licensed attorney representation. Consult a real estate attorney before proceeding.
        </div>
      )}
    </div>
  )
}
