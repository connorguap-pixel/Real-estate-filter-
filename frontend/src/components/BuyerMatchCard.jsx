import React, { useState, useEffect } from 'react'
import { Users, Phone, Mail, MapPin, DollarSign, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function matchesBuyer(buyer, propertyData) {
  const { zip, askPrice, condition } = propertyData

  // ZIP check
  const zipCodes = buyer.zipCodes || []
  if (zipCodes.length > 0 && zip && !zipCodes.includes(zip)) return false

  // Price range check
  const price = parseFloat(askPrice) || 0
  if (buyer.minPrice != null && price < buyer.minPrice) return false
  if (buyer.maxPrice != null && price > buyer.maxPrice) return false

  // Condition check
  const conditions = buyer.conditions || []
  if (conditions.length > 0 && condition && !conditions.includes(condition)) return false

  return true
}

export default function BuyerMatchCard({ propertyData }) {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/buyers')
      .then(res => setBuyers(res.data || []))
      .catch(err => setError(err.message || 'Failed to load buyers'))
      .finally(() => setLoading(false))
  }, [])

  const matches = buyers.filter(b => matchesBuyer(b, propertyData))
  const count = matches.length

  const borderColor = count >= 3 ? 'border-green-600' : count >= 1 ? 'border-yellow-600' : 'border-slate-700'
  const badgeBg = count >= 3 ? 'bg-green-900/40 text-green-300' : count >= 1 ? 'bg-yellow-900/40 text-yellow-300' : 'bg-slate-700 text-slate-400'
  const headerColor = count >= 3 ? 'text-green-400' : count >= 1 ? 'text-yellow-400' : 'text-slate-400'

  return (
    <div className={`bg-slate-800 border ${borderColor} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className={headerColor} />
          <h3 className="text-white font-semibold text-sm">Buyer Auto-Match</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg}`}>
          {count} {count === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {loading && (
        <p className="text-slate-500 text-sm">Loading buyers...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!loading && !error && count === 0 && (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm opacity-60">No buyers match — add buyers to your list</p>
          <Link to="/buyers" className="mt-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
            <ExternalLink size={12} /> Add to Buyers List
          </Link>
        </div>
      )}

      {!loading && !error && count > 0 && (
        <div className="space-y-3">
          <p className={`text-sm font-medium ${headerColor}`}>
            {count} buyer{count !== 1 ? 's' : ''} on your list match this deal
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {matches.map((buyer, i) => (
              <div key={buyer.id || i} className="bg-slate-900 rounded-lg p-3 space-y-1.5">
                <div className="text-white font-semibold text-sm">{buyer.name || 'Unnamed Buyer'}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
                  {buyer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={10} />
                      <span>{buyer.phone}</span>
                    </div>
                  )}
                  {buyer.email && (
                    <div className="flex items-center gap-1 truncate">
                      <Mail size={10} />
                      <span className="truncate">{buyer.email}</span>
                    </div>
                  )}
                  {buyer.zipCodes && buyer.zipCodes.length > 0 && (
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin size={10} />
                      <span>ZIPs: {buyer.zipCodes.join(', ')}</span>
                    </div>
                  )}
                  {(buyer.minPrice != null || buyer.maxPrice != null) && (
                    <div className="flex items-center gap-1 col-span-2">
                      <DollarSign size={10} />
                      <span>
                        {buyer.minPrice != null ? `$${buyer.minPrice.toLocaleString()}` : '$0'}
                        {' — '}
                        {buyer.maxPrice != null ? `$${buyer.maxPrice.toLocaleString()}` : 'any'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link to="/buyers" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
            <ExternalLink size={12} /> Manage Buyers List
          </Link>
        </div>
      )}
    </div>
  )
}
