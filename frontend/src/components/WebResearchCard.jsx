import React, { useState } from 'react'
import { Globe, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

export default function WebResearchCard({ findings = [] }) {
  const [open, setOpen] = useState(true)

  if (!findings || findings.length === 0) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-blue-400" />
          <span className="font-semibold text-white text-sm">Web Research Summary</span>
          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{findings.length} results</span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-700 divide-y divide-slate-700/50">
          {findings.map((finding, i) => (
            <div key={i} className="px-4 py-3 space-y-1">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 px-1.5 py-0.5 bg-blue-900/50 text-blue-400 text-xs font-semibold rounded shrink-0">[WEB]</span>
                <div className="flex-1 min-w-0">
                  {finding.title && (
                    <div className="text-sm text-white font-medium truncate">{finding.title}</div>
                  )}
                  {finding.snippet && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-3">{finding.snippet}</p>
                  )}
                  {finding.url && (
                    <a
                      href={finding.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 mt-1 transition-colors"
                    >
                      <ExternalLink size={10} />
                      <span className="truncate max-w-xs">{finding.url}</span>
                    </a>
                  )}
                  {finding.timestamp && (
                    <div className="text-xs text-slate-600 mt-0.5">{new Date(finding.timestamp).toLocaleString()}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
