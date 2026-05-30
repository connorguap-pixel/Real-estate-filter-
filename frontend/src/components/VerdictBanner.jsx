import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react'

const VERDICT_STYLES = {
  positive: { bg: 'bg-green-900/30', border: 'border-green-600', text: 'text-green-400', icon: CheckCircle },
  neutral: { bg: 'bg-yellow-900/30', border: 'border-yellow-600', text: 'text-yellow-400', icon: AlertTriangle },
  negative: { bg: 'bg-red-900/30', border: 'border-red-600', text: 'text-red-400', icon: XCircle },
}

function getStyle(verdict) {
  if (!verdict) return VERDICT_STYLES.neutral
  const lower = verdict.toLowerCase()
  if (lower.includes('strong') || lower.includes('good')) return VERDICT_STYLES.positive
  if (lower.includes('pass') || lower.includes('dead') || lower.includes('negative') || lower.includes('hard stop')) return VERDICT_STYLES.negative
  return VERDICT_STYLES.neutral
}

const confidenceColors = {
  high: 'bg-green-900/50 text-green-400 border-green-700',
  medium: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
  low: 'bg-slate-800 text-slate-400 border-slate-600'
}

export default function VerdictBanner({ verdict, confidence, explanation, topRisk }) {
  const style = getStyle(verdict)
  const Icon = style.icon

  return (
    <div className={`rounded-xl border p-5 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`${style.text} mt-0.5 shrink-0`} size={24} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h3 className={`text-xl font-bold ${style.text}`}>{verdict || 'Analysis Pending'}</h3>
            {confidence && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded border capitalize ${confidenceColors[confidence] || confidenceColors.low}`}>
                {confidence} confidence
              </span>
            )}
          </div>

          {explanation && (
            <p className="text-slate-300 text-sm leading-relaxed mb-3">{explanation}</p>
          )}

          {topRisk && (
            <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3">
              <TrendingUp size={14} className="text-orange-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-orange-400 uppercase">Top Risk: </span>
                <span className="text-sm text-slate-300">{topRisk}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
