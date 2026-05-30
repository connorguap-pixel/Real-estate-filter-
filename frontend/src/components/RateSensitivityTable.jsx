import React from 'react'

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '$0'
  const abs = Math.abs(Math.round(n))
  return (n < 0 ? '-$' : '$') + abs.toLocaleString()
}

export default function RateSensitivityTable({ data = [], breakEvenRate = null }) {
  if (!data || data.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white">Rate Sensitivity Analysis</h4>
      <div className="overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs text-slate-400 font-semibold">Rate</th>
              <th className="px-3 py-2 text-left text-xs text-slate-400 font-semibold">Monthly Payment</th>
              <th className="px-3 py-2 text-left text-xs text-slate-400 font-semibold">Monthly CF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((row, i) => {
              const isBase = i === 0
              const isBreakEven = breakEvenRate !== null && Math.abs(row.rate - breakEvenRate) < 0.3
              return (
                <tr
                  key={i}
                  className={`${isBreakEven ? 'bg-yellow-900/20 border-l-2 border-yellow-500' : isBase ? 'bg-slate-800/50' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <span className={`font-medium ${isBreakEven ? 'text-yellow-400' : 'text-white'}`}>
                      {row.rate.toFixed(1)}%
                    </span>
                    {isBase && <span className="ml-1 text-xs text-blue-400">(base)</span>}
                    {isBreakEven && <span className="ml-1 text-xs text-yellow-400">(≈break-even)</span>}
                  </td>
                  <td className="px-3 py-2.5 text-white">{fmt(row.payment)}</td>
                  <td className="px-3 py-2.5">
                    <span className={row.cashFlow >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                      {fmt(row.cashFlow)}/mo
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {breakEvenRate !== null && (
        <p className="text-xs text-slate-400">
          Break-Even Rate: <span className="text-yellow-400 font-semibold">{breakEvenRate.toFixed(2)}%</span>
        </p>
      )}
    </div>
  )
}
