import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import axios from 'axios'

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCached(zip) {
  try {
    const raw = localStorage.getItem(`market_trend_${zip}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(zip, data) {
  try {
    localStorage.setItem(`market_trend_${zip}`, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export default function MarketTrendOverlay({ zip, county, state }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchTrends(forceRefresh = false) {
    if (!zip) return
    if (!forceRefresh) {
      const cached = getCached(zip)
      if (cached) { setData(cached); return }
    }
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post('/api/analyze/market-trends', { zip, county, state })
      setData(res.data)
      setCache(zip, res.data)
    } catch (err) {
      setError('Could not load market data')
      // Fallback placeholder data
      const fallback = {
        appreciation12mo: null,
        avgDaysOnMarket: null,
        activeListings: null,
        soldLast90: null,
        investorActivity: 'Unknown',
        source: 'unavailable',
        note: 'Market data unavailable — web search required'
      }
      setData(fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrends() }, [zip])

  if (!zip) return null

  const activityColor = {
    Hot: 'text-green-400',
    Normal: 'text-yellow-400',
    Slow: 'text-red-400',
    Unknown: 'text-slate-500',
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold text-sm">Market Trend Overlay</div>
          <div className="text-slate-500 text-xs">ZIP {zip}{county ? ` · ${county} County` : ''}</div>
        </div>
        <button
          onClick={() => fetchTrends(true)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
          <RefreshCw size={14} className="animate-spin" />
          Searching market data via web...
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">12-Month Appreciation</div>
            {data.appreciation12mo !== null ? (
              <div className={`font-bold text-base flex items-center gap-1 ${data.appreciation12mo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.appreciation12mo >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {data.appreciation12mo >= 0 ? '+' : ''}{data.appreciation12mo?.toFixed(1)}%
              </div>
            ) : <div className="text-slate-500 text-xs">No data</div>}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Avg Days on Market</div>
            {data.avgDaysOnMarket !== null ? (
              <div className="font-bold text-base text-white">{data.avgDaysOnMarket} days</div>
            ) : <div className="text-slate-500 text-xs">No data</div>}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Active vs Sold Ratio</div>
            {data.activeListings !== null && data.soldLast90 !== null ? (
              <div className="font-bold text-base text-white">
                {data.activeListings} / {data.soldLast90}
                <span className="text-slate-500 text-xs font-normal ml-1">(90d)</span>
              </div>
            ) : <div className="text-slate-500 text-xs">No data</div>}
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Investor Activity</div>
            <div className={`font-bold text-base ${activityColor[data.investorActivity] || 'text-slate-400'}`}>
              {data.investorActivity}
            </div>
          </div>
        </div>
      )}

      {data?.note && (
        <div className="text-xs text-slate-500 italic">{data.note}</div>
      )}

      {error && <div className="text-xs text-red-400">{error}</div>}

      <div className="text-xs text-slate-600">Data cached 24h per ZIP · sourced via web search</div>
    </div>
  )
}
