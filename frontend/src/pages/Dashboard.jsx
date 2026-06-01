import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Building2, Flame, Clock, TrendingUp, Search, Zap, Users, KanbanSquare, RefreshCw } from 'lucide-react'
import AuctionCountdown from '../components/AuctionCountdown.jsx'
import EmptyState from '../components/EmptyState.jsx'

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-900/20',
    red: 'text-red-400 bg-red-900/20',
    green: 'text-green-400 bg-green-900/20',
    yellow: 'text-yellow-400 bg-yellow-900/20'
  }
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={22} className={colors[color].split(' ')[0]} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [upcomingAuctions, setUpcomingAuctions] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const [propsRes, auctionsRes] = await Promise.allSettled([
        axios.get('/api/properties'),
        axios.get('/api/notifications/upcoming-auctions')
      ])
      if (propsRes.status === 'fulfilled') setProperties(propsRes.value.data || [])
      if (auctionsRes.status === 'fulfilled') setUpcomingAuctions(auctionsRes.value.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const hotLeads = properties.filter(p => (p.distressScore || 0) >= 70)
  const urgentAuctionCount = upcomingAuctions.filter(p => {
    if (!p.auctionDate) return false
    const days = Math.floor((new Date(p.auctionDate) - new Date()) / 86400000)
    return days >= 0 && days <= 14
  }).length
  const avgEquityScore = properties.length > 0
    ? Math.round(properties.reduce((s, p) => s + (p.equityScore || 0), 0) / properties.length)
    : 0
  const recent = [...properties].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)

  const verdictColor = (v = '') => {
    const lower = v.toLowerCase()
    if (lower.includes('strong') || lower.includes('good')) return 'text-green-400'
    if (lower.includes('pass') || lower.includes('dead')) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track DealOS Property Analyzer</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Leads" value={properties.length} color="blue" />
        <StatCard icon={Flame} label="Hot Leads (Score ≥70)" value={hotLeads.length} color="red" />
        <StatCard icon={Clock} label="Urgent Auctions (≤14d)" value={urgentAuctionCount} color="yellow" />
        <StatCard icon={TrendingUp} label="Avg Equity Score" value={avgEquityScore} color="green" />
      </div>

      {/* Urgent auctions */}
      {upcomingAuctions.length > 0 && (
        <div className="bg-slate-800 border border-orange-800 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} className="text-orange-400" />
            Urgent — Upcoming Auctions
          </h2>
          <div className="space-y-2">
            {upcomingAuctions.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2">
                <div>
                  <span className="text-white text-sm font-medium">{p.address}</span>
                  <span className="text-slate-500 text-xs ml-2">{p.city}, {p.state}</span>
                </div>
                <AuctionCountdown auctionDate={p.auctionDate} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/analyze', icon: Search, label: 'Analyze Property', desc: 'Full AI analysis' },
          { to: '/quick', icon: Zap, label: 'Quick Analyze', desc: '5 fields, instant score' },
          { to: '/crm', icon: Users, label: 'CRM', desc: 'Manage your leads' },
          { to: '/pipeline', icon: KanbanSquare, label: 'Pipeline', desc: 'Drag-drop kanban' }
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="bg-slate-800 border border-slate-700 hover:border-blue-600 rounded-xl p-4 transition-all group">
            <Icon size={20} className="text-blue-400 mb-2" />
            <div className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">{label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-white font-semibold text-sm">Recent Leads</h2>
          <Link to="/crm" className="text-blue-400 text-xs hover:text-blue-300 transition-colors">View all →</Link>
        </div>
        {loading ? (
          <div className="py-10 text-center text-slate-500 text-sm">Loading...</div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="No leads yet"
            description="Analyze your first distressed property to see it here."
            actionLabel="Analyze a Property"
            onAction={() => navigate('/analyze')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Address</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Verdict</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Distress</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Equity</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold">Added</th>
                  <th className="px-4 py-2.5 text-left text-xs text-slate-400 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recent.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="text-white text-xs font-medium">{p.address}</div>
                      <div className="text-slate-500 text-xs">{p.city}, {p.state}</div>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        verdictColor(p.finalVerdict) === 'text-green-400' ? 'bg-green-900/30 text-green-400' :
                        verdictColor(p.finalVerdict) === 'text-red-400' ? 'bg-red-900/30 text-red-400' :
                        'bg-yellow-900/30 text-yellow-400'
                      }`}>{p.finalVerdict?.substring(0, 25) || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-sm font-bold text-blue-400">{p.distressScore ?? '—'}</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-purple-400">{p.equityScore ?? '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link to="/crm" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
