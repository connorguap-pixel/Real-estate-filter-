import React, { useState } from 'react'

const INTEGRATIONS = [
  {
    name: 'Zillow',
    initials: 'Z',
    accent: 'bg-blue-600',
    ring: 'ring-blue-500',
    description: 'Automated Valuation Models (AVM), Zestimates, property details, and comparable sales data directly from Zillow\'s database.'
  },
  {
    name: 'ATTOM Data Solutions',
    initials: 'AT',
    accent: 'bg-green-600',
    ring: 'ring-green-500',
    description: 'Nationwide property, neighborhood, school, and environmental data — tax assessments, deed history, and mortgage records.'
  },
  {
    name: 'Estated',
    initials: 'ES',
    accent: 'bg-purple-600',
    ring: 'ring-purple-500',
    description: 'Parcel-level property data including ownership, structures, liens, valuations, and detailed tax records for any US address.'
  },
  {
    name: 'BatchData',
    initials: 'BD',
    accent: 'bg-orange-600',
    ring: 'ring-orange-500',
    description: 'Skip tracing, phone appending, distressed property lists, and bulk data enrichment for real estate investors.'
  },
  {
    name: 'DataTree',
    initials: 'DT',
    accent: 'bg-teal-600',
    ring: 'ring-teal-500',
    description: 'First American\'s comprehensive property intelligence: title, foreclosure, lien, deed, and tax data with chain-of-title history.'
  },
  {
    name: 'PropStream',
    initials: 'PS',
    accent: 'bg-red-600',
    ring: 'ring-red-500',
    description: 'All-in-one real estate data platform for investor leads, comps, equity analysis, and motivated seller identification.'
  }
]

function TooltipButton({ accent }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <button
        disabled
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white opacity-50 cursor-not-allowed ${accent}`}
      >
        Request Priority Access
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-700 text-slate-200 text-xs rounded-lg whitespace-nowrap shadow-lg z-10 border border-slate-600">
          Vote to prioritize this integration
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid #334155'}} />
        </div>
      )}
    </div>
  )
}

export default function ApiIntegrationCards() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-base">API Integrations</h3>
        <p className="text-slate-400 text-sm mt-1">Connect live data providers to auto-fill property analysis. Vote for integrations to prioritize.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTEGRATIONS.map(({ name, initials, accent, ring, description }) => (
          <div
            key={name}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${accent} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-offset-2 ring-offset-slate-800 ${ring}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-white font-semibold text-sm leading-tight">{name}</h4>
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-500/30 whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">{description}</p>
            <TooltipButton accent={accent} />
          </div>
        ))}
      </div>
    </div>
  )
}
