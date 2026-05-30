import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { calcDistressScore, calcEquityScore } from '../lib/scoring.js'
import LegalDisclaimer from '../components/LegalDisclaimer.jsx'

export default function QuickAnalyze() {
  const [form, setForm] = useState({ address: '', arv: '', askPrice: '', repairs: '', mortgageBalance: '' })
  const [result, setResult] = useState(null)

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  function analyze() {
    const arv = parseFloat(form.arv) || 0
    const repairs = parseFloat(form.repairs) || 0
    const mortgage = parseFloat(form.mortgageBalance) || 0
    const ask = parseFloat(form.askPrice) || 0

    const property = { arv, repairEstimate: repairs, mortgageBalance: mortgage, askPrice: ask, allLiens: 0 }
    const distress = calcDistressScore(property)
    const equityResult = calcEquityScore(property)
    const combined = distress + equityResult.score

    const rawEquity = arv - mortgage - repairs - (arv * 0.08)
    const mao = arv * 0.70 - repairs - 8000
    const spread = mao - ask

    let verdict = 'Pass'
    let verdictColor = 'text-red-400'
    let strategy = 'Not viable'

    if (combined >= 140 && equityResult.score >= 50) {
      verdict = 'Strong Lead'
      verdictColor = 'text-green-400'
      strategy = 'Wholesale'
    } else if (combined >= 100) {
      verdict = 'Potential Deal'
      verdictColor = 'text-yellow-400'
      strategy = 'Investigate Further'
    } else if (combined >= 70) {
      verdict = 'Marginal — Dig Deeper'
      verdictColor = 'text-yellow-600'
      strategy = 'Creative Finance possible'
    }

    setResult({ distress, equity: equityResult.score, combined, rawEquity, mao, spread, verdict, verdictColor, strategy })
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600'

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Zap size={24} className="text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Quick Analyze</h1>
          <p className="text-slate-400 text-sm">5 fields. Instant score. No AI call.</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Address</label>
          <input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="123 Main St, City, FL 33101" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">ARV ($)</label>
            <input type="number" value={form.arv} onChange={e => setField('arv', e.target.value)} placeholder="280000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Ask Price ($)</label>
            <input type="number" value={form.askPrice} onChange={e => setField('askPrice', e.target.value)} placeholder="195000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Repair Estimate ($)</label>
            <input type="number" value={form.repairs} onChange={e => setField('repairs', e.target.value)} placeholder="25000" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mortgage Balance ($)</label>
            <input type="number" value={form.mortgageBalance} onChange={e => setField('mortgageBalance', e.target.value)} placeholder="150000" className={inputCls} />
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={!form.arv}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          Quick Analyze
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Go/No-Go badge */}
          <div className={`text-center py-5 rounded-xl border ${result.combined >= 100 ? 'bg-green-900/20 border-green-700' : result.combined >= 70 ? 'bg-yellow-900/20 border-yellow-700' : 'bg-red-900/20 border-red-700'}`}>
            <div className={`text-3xl font-black ${result.verdictColor}`}>{result.verdict}</div>
            <div className="text-slate-400 text-sm mt-1">Top strategy: <span className="text-white font-medium">{result.strategy}</span></div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{result.distress}</div>
              <div className="text-xs text-slate-400">Distress</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{result.equity}</div>
              <div className="text-xs text-slate-400">Equity</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${result.combined >= 140 ? 'text-green-400' : result.combined >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>{result.combined}</div>
              <div className="text-xs text-slate-400">Combined</div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Raw Equity</div>
              <div className={`font-semibold ${result.rawEquity >= 0 ? 'text-green-400' : 'text-red-400'}`}>${Math.abs(Math.round(result.rawEquity)).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">MAO (70% rule)</div>
              <div className={`font-semibold ${result.mao > 0 ? 'text-white' : 'text-red-400'}`}>${Math.round(result.mao).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-0.5">Spread (MAO vs Ask)</div>
              <div className={`font-semibold ${result.spread >= 0 ? 'text-green-400' : 'text-red-400'}`}>${Math.round(result.spread).toLocaleString()}</div>
            </div>
          </div>

          <Link
            to={`/analyze?address=${encodeURIComponent(form.address)}&arv=${form.arv}&askPrice=${form.askPrice}&repairs=${form.repairs}&mortgageBalance=${form.mortgageBalance}`}
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Run Full AI Analysis →
          </Link>

          <LegalDisclaimer />
        </div>
      )}
    </div>
  )
}
