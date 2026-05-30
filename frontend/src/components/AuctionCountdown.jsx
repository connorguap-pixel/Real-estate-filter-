import React from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

export default function AuctionCountdown({ auctionDate }) {
  if (!auctionDate) return null

  const now = new Date()
  const auction = new Date(auctionDate)
  const days = Math.floor((auction - now) / 86400000)

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-500 text-xs rounded-full border border-slate-700">
        <Clock size={10} />
        Passed {Math.abs(days)}d ago
      </span>
    )
  }

  let colorClass = 'bg-yellow-900/40 text-yellow-400 border-yellow-700'
  if (days <= 7) colorClass = 'bg-red-900/50 text-red-400 border-red-700 animate-pulse'
  else if (days <= 14) colorClass = 'bg-orange-900/40 text-orange-400 border-orange-700'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border font-semibold ${colorClass}`}>
      {days <= 14 && <AlertTriangle size={10} />}
      <Clock size={10} />
      {days === 0 ? 'TODAY' : `${days}d`}
      {days <= 14 && <span className="ml-0.5 font-bold">URGENT</span>}
    </span>
  )
}
