import React from 'react'

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-800/50 border border-slate-700 rounded-xl">
      {icon && (
        <div className="text-5xl mb-4 text-slate-500">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-slate-400 text-sm max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
