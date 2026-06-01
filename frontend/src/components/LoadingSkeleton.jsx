import React from 'react'

export default function LoadingSkeleton({ rows = 3, height = 'h-4', className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-700 rounded-lg ${height}`}
          style={{ width: i % 3 === 2 ? '60%' : i % 2 === 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function AnalysisLoadingSkeleton() {
  return (
    <div className="space-y-5 pt-2 animate-pulse">
      <div className="border-t border-slate-700 pt-5">
        <div className="h-6 bg-slate-700 rounded w-48 mb-4" />
      </div>

      {/* Score gauges */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="flex justify-around">
          <div className="flex flex-col items-center gap-3">
            <div className="w-36 h-36 rounded-full bg-slate-700" />
            <div className="h-4 bg-slate-700 rounded w-24" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-36 h-36 rounded-full bg-slate-700" />
            <div className="h-4 bg-slate-700 rounded w-24" />
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="h-4 bg-slate-700 rounded w-48" />
        </div>
      </div>

      {/* Badge chips */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <div className="h-4 bg-slate-700 rounded w-32 mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-slate-700 rounded-full w-20" />
          ))}
        </div>
      </div>

      {/* Card outlines */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <div className="h-4 bg-slate-700 rounded w-40" />
          <div className="h-3 bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-700 rounded w-4/5" />
          <div className="h-3 bg-slate-700 rounded w-3/5" />
        </div>
      ))}
    </div>
  )
}
