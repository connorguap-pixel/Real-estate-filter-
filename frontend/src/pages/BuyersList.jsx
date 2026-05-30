import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusCircle, X, BookUser, Phone, Mail, MapPin } from 'lucide-react'

const CONDITION_OPTIONS = ['As-Is', 'Turnkey', 'Light Rehab', 'Heavy Rehab', 'Any']
const STRATEGY_OPTIONS = ['Wholesale', 'Buy & Hold', 'BRRRR', 'Fix & Flip', 'Creative Finance']

const DEFAULT_FORM = {
  name: '', email: '', phone: '', zipCodes: '', minPrice: '', maxPrice: '',
  conditions: [], strategies: [], notes: ''
}

export default function BuyersList() {
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchBuyers() {
    setLoading(true)
    try {
      const res = await axios.get('/api/buyers')
      setBuyers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBuyers() }, [])

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })) }
  function toggleMulti(k, v) {
    setForm(prev => ({
      ...prev,
      [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v]
    }))
  }

  async function handleSave() {
    if (!form.name) { setError('Name required'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        zipCodes: form.zipCodes.split(',').map(z => z.trim()).filter(Boolean),
        minPrice: form.minPrice ? parseFloat(form.minPrice) : null,
        maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null
      }
      const res = await axios.post('/api/buyers', payload)
      setBuyers(prev => [res.data, ...prev])
      setForm(DEFAULT_FORM)
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save buyer')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBuyer(id) {
    try {
      await axios.delete(`/api/buyers/${id}`)
      setBuyers(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600'

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookUser size={22} className="text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Buyers List</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          <PlusCircle size={14} />
          Add Buyer
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">New Buyer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Investor name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="investor@email.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="555-555-5555" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ZIP Codes (comma-separated)</label>
              <input value={form.zipCodes} onChange={e => setField('zipCodes', e.target.value)} placeholder="33101, 33102, 33103" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min Price ($)</label>
              <input type="number" value={form.minPrice} onChange={e => setField('minPrice', e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Price ($)</label>
              <input type="number" value={form.maxPrice} onChange={e => setField('maxPrice', e.target.value)} placeholder="500000" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Conditions</label>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleMulti('conditions', c)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${form.conditions.includes(c) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">Strategies</label>
            <div className="flex flex-wrap gap-2">
              {STRATEGY_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleMulti('strategies', s)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${form.strategies.includes(s) ? 'bg-purple-700 border-purple-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setField('notes', e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Save Buyer'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading buyers...</div>
      ) : buyers.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-500">No buyers yet.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-blue-400 text-sm hover:text-blue-300 transition-colors">Add your first buyer →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyers.map(buyer => (
            <div key={buyer.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 relative group">
              <button
                onClick={() => deleteBuyer(buyer.id)}
                className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
              <div className="text-white font-semibold mb-2">{buyer.name}</div>
              <div className="space-y-1 text-sm text-slate-400">
                {buyer.email && (
                  <div className="flex items-center gap-1.5"><Mail size={12} />{buyer.email}</div>
                )}
                {buyer.phone && (
                  <div className="flex items-center gap-1.5"><Phone size={12} />{buyer.phone}</div>
                )}
                {buyer.zipCodes?.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <MapPin size={12} className="mt-0.5" />
                    <span>{buyer.zipCodes.join(', ')}</span>
                  </div>
                )}
                {(buyer.minPrice || buyer.maxPrice) && (
                  <div className="text-slate-400 text-xs">
                    Price: ${(buyer.minPrice || 0).toLocaleString()} – ${(buyer.maxPrice || 0).toLocaleString()}
                  </div>
                )}
              </div>
              {(buyer.strategies?.length > 0 || buyer.conditions?.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {buyer.strategies?.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-purple-900/40 text-purple-400 text-xs rounded-full">{s}</span>
                  ))}
                  {buyer.conditions?.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-blue-900/40 text-blue-400 text-xs rounded-full">{c}</span>
                  ))}
                </div>
              )}
              {buyer.notes && (
                <p className="text-slate-500 text-xs mt-2 line-clamp-2">{buyer.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
