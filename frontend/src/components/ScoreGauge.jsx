import React from 'react'

export default function ScoreGauge({ score = 0, label = '', size = 120 }) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const radius = 45
  const circumference = Math.PI * radius // half-circle arc length
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference

  let color = '#ef4444' // red
  if (clampedScore >= 70) color = '#22c55e' // green
  else if (clampedScore >= 40) color = '#eab308' // yellow

  let scoreLabel = 'Low'
  if (clampedScore >= 70) scoreLabel = 'High'
  else if (clampedScore >= 40) scoreLabel = 'Medium'

  const cx = size / 2
  const cy = size / 2 + 10
  const r = radius * (size / 120)
  const adjCircumference = Math.PI * r
  const adjOffset = adjCircumference - (clampedScore / 100) * adjCircumference

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        {/* Background arc */}
        <path
          d={`M ${size * 0.08} ${size * 0.65} A ${r} ${r} 0 0 1 ${size * 0.92} ${size * 0.65}`}
          fill="none"
          stroke="#334155"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${size * 0.08} ${size * 0.65} A ${r} ${r} 0 0 1 ${size * 0.92} ${size * 0.65}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={adjCircumference}
          strokeDashoffset={adjOffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Score number */}
        <text
          x={size / 2}
          y={size * 0.5}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.22}
          fontWeight="700"
        >
          {clampedScore}
        </text>
        <text
          x={size / 2}
          y={size * 0.65}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.1}
          fontWeight="500"
        >
          {scoreLabel}
        </text>
      </svg>
      <div className="text-xs text-slate-400 font-medium mt-1">{label}</div>
    </div>
  )
}
