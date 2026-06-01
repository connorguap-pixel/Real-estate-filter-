import React, { useState } from 'react'
import axios from 'axios'
import { Upload, FileText, Cpu, Loader2, PlusCircle, X, Search } from 'lucide-react'
import { AnalysisLoadingSkeleton } from '../components/LoadingSkeleton.jsx'
import ScoreGauge from '../components/ScoreGauge.jsx'
import RedFlagBadges from '../components/RedFlagBadges.jsx'
import StrategyCard from '../components/StrategyCard.jsx'
import VerdictBanner from '../components/VerdictBanner.jsx'
import WebResearchCard from '../components/WebResearchCard.jsx'
import RateSensitivityTable from '../components/RateSensitivityTable.jsx'
import RepairEstimator from '../components/RepairEstimator.jsx'
import BatchLeadTable from '../components/BatchLeadTable.jsx'
import CSVMappingScreen from '../components/CSVMappingScreen.jsx'
import LegalDisclaimer from '../components/LegalDisclaimer.jsx'
import AuctionCountdown from '../components/AuctionCountdown.jsx'
import { calcRateSensitivity, calcBreakEvenRate } from '../lib/formulas.js'
import { applyMappings } from '../lib/csvMapper.js'
import MarketTrendOverlay from '../components/MarketTrendOverlay.jsx'
import StateRulesCard from '../components/StateRulesCard.jsx'
import OutreachTemplates from './OutreachTemplates.jsx'
import BuyerMatchCard from '../components/BuyerMatchCard.jsx'
import ApiIntegrationCards from '../components/ApiIntegrationCards.jsx'
import ForeclosureAnalysis from '../components/ForeclosureAnalysis.jsx'
import SurplusFundsAnalysis from '../components/SurplusFundsAnalysis.jsx'
import ProbateAnalysis from '../components/ProbateAnalysis.jsx'

const CONDITION_OPTIONS = ['Turnkey', 'Good', 'Fair', 'Poor', 'Distressed', 'Needs Full Rehab']
const PROPERTY_TYPES = ['SFR', 'Duplex', 'Triplex', 'Fourplex', 'Condo', 'Mobile Home', 'Commercial', 'Land']
const TIMELINE_OPTIONS = ['ASAP', '30 days', '60 days', '90 days', '6 months', 'Flexible', 'Unknown']

const defaultForm = {
  address: '', city: '', state: '', county: '', zip: '',
  propertyType: 'SFR', beds: '', baths: '', sqft: '', lotSize: '', yearBuilt: '',
  owner: '', mailingAddress: '', absenteeOwner: false,
  estimatedAvm: '', arv: '', mortgageBalance: '',
  taxDelinquency: '', preforeclosure: false, auctionDate: '', judgmentAmount: '', finalSalePrice: '',
  rent: '', askPrice: '', sellerMotivation: 5, sellerTimeline: 'Unknown',
  interestRate: 7.0, monthlyPayment: '', arrears: '',
  propertyCondition: 'Fair', repairEstimate: '',
  notes: '', vacant: false, absenteeOwner2: false, probateSignals: false,
  failedListing90: false, activeLiens: false, codeViolations: false, ownershipYears: '',
  irsLien: false, hoaLien: false, unclearTitle: false, bankruptcy: false, activeLitigation: false,
  allLiens: '', surplusRequiresAttorney: false,
  annualTax: '', annualInsurance: '', vacancyRate: 0.08, mgmtRate: 0.08,
  holdingDays: 60, windows: 10
}

function FormField({ label, children, hint }) {
  return (
    <div>
      <label className="flex items-center text-xs font-medium text-slate-400 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-0.5">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600 ${className}`}
    />
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-700'}`} onClick={onChange}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  )
}

export default function AnalyzeProperty() {
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showRepairEstimator, setShowRepairEstimator] = useState(false)
  const [liens, setLiens] = useState([])
  const [prefilling, setPrefilling] = useState(false)
  const [webPrefilledFields, setWebPrefilledFields] = useState(new Set())

  // CSV tab state
  const [csvStep, setCsvStep] = useState('upload') // upload | map | results
  const [csvHeaders, setCsvHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [autoMappings, setAutoMappings] = useState({})
  const [scoredLeads, setScoredLeads] = useState([])
  const [csvLoading, setCsvLoading] = useState(false)
  const [showOutreach, setShowOutreach] = useState(false)

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handlePrefill() {
    if (!form.address) return
    setPrefilling(true)
    try {
      const res = await axios.post('/api/analyze/prefill', {
        address: form.address, city: form.city, state: form.state, zip: form.zip
      })
      const data = res.data
      const filled = new Set()
      const updates = {}
      const fields = ['beds','baths','sqft','yearBuilt','estimatedAvm','owner','taxDelinquency','preforeclosure']
      fields.forEach(f => {
        if (data[f] !== null && data[f] !== undefined && !form[f]) {
          updates[f] = data[f]
          filled.add(f)
        }
      })
      setForm(prev => ({ ...prev, ...updates }))
      setWebPrefilledFields(filled)
    } catch (err) {
      console.error('Prefill failed', err)
    } finally {
      setPrefilling(false)
    }
  }

  function addLien() { setLiens(prev => [...prev, { type: 'HOA', amount: '' }]) }
  function removeLien(i) { setLiens(prev => prev.filter((_, idx) => idx !== i)) }
  function updateLien(i, k, v) {
    setLiens(prev => { const n = [...prev]; n[i] = { ...n[i], [k]: v }; return n })
  }

  const totalLiens = liens.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const hasIrsLien = liens.some(l => l.type === 'IRS')
  const hasHoaLien = liens.some(l => l.type === 'HOA')

  async function handleAnalyze() {
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        beds: parseFloat(form.beds) || undefined,
        baths: parseFloat(form.baths) || undefined,
        sqft: parseFloat(form.sqft) || undefined,
        yearBuilt: parseInt(form.yearBuilt) || undefined,
        arv: parseFloat(form.arv) || 0,
        askPrice: parseFloat(form.askPrice) || 0,
        mortgageBalance: parseFloat(form.mortgageBalance) || 0,
        repairEstimate: parseFloat(form.repairEstimate) || 0,
        taxDelinquency: parseFloat(form.taxDelinquency) || 0,
        rent: parseFloat(form.rent) || 0,
        allLiens: totalLiens + (parseFloat(form.allLiens) || 0),
        irsLien: form.irsLien || hasIrsLien,
        hoaLien: form.hoaLien || hasHoaLien,
        interestRate: parseFloat(form.interestRate) || 7.0,
        annualTax: parseFloat(form.annualTax) || 2400,
        annualInsurance: parseFloat(form.annualInsurance) || 1200,
        ownershipYears: parseFloat(form.ownershipYears) || 0,
        liens
      }
      const res = await axios.post('/api/analyze', payload)
      setResult({ ...res.data, propertyData: payload })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCSVUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/batch/upload', formData)
      setCsvHeaders(res.data.headers)
      setCsvRows(res.data.rows)
      setAutoMappings(res.data.autoMappings)
      setCsvStep('map')
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setCsvLoading(false)
    }
  }

  async function handleMappingConfirm(mappings) {
    setCsvLoading(true)
    try {
      const mapped = csvRows.map(row => applyMappings(row, mappings))
      const res = await axios.post('/api/batch/score', { leads: mapped })
      setScoredLeads(res.data.leads)
      setCsvStep('results')
    } catch (err) {
      setError(err.response?.data?.error || 'Scoring failed')
    } finally {
      setCsvLoading(false)
    }
  }

  function handleSelectLead(lead) {
    setForm(prev => ({
      ...prev,
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip: lead.zip || '',
      arv: lead.arv || lead.estimatedValue || '',
      mortgageBalance: lead.mortgageBalance || '',
      repairEstimate: lead.repairEstimate || '',
      beds: lead.bedrooms || lead.beds || '',
      baths: lead.bathrooms || lead.baths || '',
      preforeclosure: lead.preforeclosure === 'true' || false,
      taxDelinquency: lead.taxDelinquency || ''
    }))
    setTab('manual')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const rateSensData = result ? calcRateSensitivity(
    parseFloat(form.mortgageBalance) * 0.75 || 0,
    parseFloat(form.interestRate) || 7,
    30,
    parseFloat(form.rent) || 0,
    form.vacancyRate, form.mgmtRate,
    parseFloat(form.annualTax) || 2400,
    parseFloat(form.annualInsurance) || 1200
  ) : []

  const breakEven = result ? calcBreakEvenRate(
    parseFloat(form.mortgageBalance) * 0.75 || 0, 30,
    parseFloat(form.rent) || 0, form.vacancyRate, form.mgmtRate,
    parseFloat(form.annualTax) || 2400, parseFloat(form.annualInsurance) || 1200
  ) : null

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600'
  const selectCls = 'w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analyze Property</h1>
        <p className="text-slate-400 text-sm mt-1">AI-powered distressed deal analysis with live web research</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-slate-800 border border-slate-700 p-1 rounded-xl w-fit">
        {[
          { key: 'manual', icon: FileText, label: 'Manual Entry' },
          { key: 'csv', icon: Upload, label: 'CSV Upload' },
          { key: 'api', icon: Cpu, label: 'API (Coming Soon)' }
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Manual entry form */}
      {tab === 'manual' && (
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Street Address *">
                  <input value={form.address} onChange={e => setField('address', e.target.value)} placeholder="123 Main St" className={inputCls} />
                </FormField>
              </div>
              <FormField label="City *">
                <input value={form.city} onChange={e => setField('city', e.target.value)} placeholder="City" className={inputCls} />
              </FormField>
              <FormField label="State *">
                <input value={form.state} onChange={e => setField('state', e.target.value.toUpperCase())} placeholder="FL" maxLength={2} className={inputCls} />
              </FormField>
              <FormField label="County">
                <input value={form.county} onChange={e => setField('county', e.target.value)} placeholder="Miami-Dade" className={inputCls} />
              </FormField>
              <FormField label="ZIP">
                <input value={form.zip} onChange={e => setField('zip', e.target.value)} placeholder="33101" className={inputCls} />
              </FormField>
              <div className="md:col-span-2">
                <button
                  onClick={handlePrefill}
                  disabled={!form.address || prefilling}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {prefilling ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {prefilling ? 'Searching public records...' : 'Search Public Data'}
                </button>
              </div>
              <FormField label="Property Type">
                <select value={form.propertyType} onChange={e => setField('propertyType', e.target.value)} className={selectCls}>
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label={<>Year Built{webPrefilledFields.has('yearBuilt') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input type="number" value={form.yearBuilt} onChange={e => setField('yearBuilt', e.target.value)} placeholder="1985" className={inputCls} />
              </FormField>
              <FormField label={<>Beds{webPrefilledFields.has('beds') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input type="number" value={form.beds} onChange={e => setField('beds', e.target.value)} placeholder="3" className={inputCls} />
              </FormField>
              <FormField label={<>Baths{webPrefilledFields.has('baths') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input type="number" value={form.baths} onChange={e => setField('baths', e.target.value)} placeholder="2" step="0.5" className={inputCls} />
              </FormField>
              <FormField label={<>Sq Ft{webPrefilledFields.has('sqft') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input type="number" value={form.sqft} onChange={e => setField('sqft', e.target.value)} placeholder="1400" className={inputCls} />
              </FormField>
              <FormField label="Lot Size (acres)">
                <input type="number" value={form.lotSize} onChange={e => setField('lotSize', e.target.value)} placeholder="0.25" step="0.01" className={inputCls} />
              </FormField>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={<>Owner Name{webPrefilledFields.has('owner') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input value={form.owner} onChange={e => setField('owner', e.target.value)} placeholder="John Smith" className={inputCls} />
              </FormField>
              <FormField label="Mailing Address">
                <input value={form.mailingAddress} onChange={e => setField('mailingAddress', e.target.value)} placeholder="Different from property?" className={inputCls} />
              </FormField>
              <FormField label="Ownership Years">
                <input type="number" value={form.ownershipYears} onChange={e => setField('ownershipYears', e.target.value)} placeholder="15" className={inputCls} />
              </FormField>
              <div className="flex flex-col gap-3 pt-5">
                <Toggle label="Absentee Owner" checked={form.absenteeOwner} onChange={() => setField('absenteeOwner', !form.absenteeOwner)} />
                <Toggle label="Vacant Property" checked={form.vacant} onChange={() => setField('vacant', !form.vacant)} />
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Financials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={<>Estimated AVM (Zestimate){webPrefilledFields.has('estimatedAvm') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>} hint="Will be web-verified — do not rely on this alone">
                <input type="number" value={form.estimatedAvm} onChange={e => setField('estimatedAvm', e.target.value)} placeholder="250000" className={inputCls} />
              </FormField>
              <FormField label="Your ARV (After Repair Value) *" hint="Your own estimate based on comps">
                <input type="number" value={form.arv} onChange={e => setField('arv', e.target.value)} placeholder="280000" className={inputCls} />
              </FormField>
              <FormField label="Mortgage Balance">
                <input type="number" value={form.mortgageBalance} onChange={e => setField('mortgageBalance', e.target.value)} placeholder="150000" className={inputCls} />
              </FormField>
              <FormField label="Seller Asking Price">
                <input type="number" value={form.askPrice} onChange={e => setField('askPrice', e.target.value)} placeholder="195000" className={inputCls} />
              </FormField>
              <FormField label="Monthly Rent Estimate">
                <input type="number" value={form.rent} onChange={e => setField('rent', e.target.value)} placeholder="1800" className={inputCls} />
              </FormField>
              <FormField label="Annual Property Tax">
                <input type="number" value={form.annualTax} onChange={e => setField('annualTax', e.target.value)} placeholder="2400" className={inputCls} />
              </FormField>
              <FormField label="Annual Insurance Est.">
                <input type="number" value={form.annualInsurance} onChange={e => setField('annualInsurance', e.target.value)} placeholder="1200" className={inputCls} />
              </FormField>
              <FormField label="Interest Rate (%)">
                <input type="number" value={form.interestRate} onChange={e => setField('interestRate', e.target.value)} step="0.125" placeholder="7.0" className={inputCls} />
              </FormField>
            </div>
          </div>

          {/* Liens */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Liens & Encumbrances</h3>
              <button onClick={addLien} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <PlusCircle size={14} /> Add Lien
              </button>
            </div>
            {liens.map((lien, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <select value={lien.type} onChange={e => updateLien(i, 'type', e.target.value)} className="bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none">
                  {['IRS', 'HOA', 'Municipal', 'Judgment', 'Mechanic', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="number" value={lien.amount} onChange={e => updateLien(i, 'amount', e.target.value)} placeholder="Amount" className="flex-1 bg-slate-700 border border-slate-600 text-white text-sm rounded px-2 py-1.5 focus:outline-none" />
                <button onClick={() => removeLien(i)} className="text-red-400 hover:text-red-300 transition-colors"><X size={14} /></button>
              </div>
            ))}
            {totalLiens > 0 && (
              <p className="text-xs text-yellow-400 mt-2">Total liens: ${totalLiens.toLocaleString()}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <FormField label={<>Tax Delinquency ($){webPrefilledFields.has('taxDelinquency') && <span className="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded font-mono">WEB</span>}</>}>
                <input type="number" value={form.taxDelinquency} onChange={e => setField('taxDelinquency', e.target.value)} placeholder="0" className={inputCls} />
              </FormField>
              <FormField label="Judgment Amount ($)">
                <input type="number" value={form.judgmentAmount} onChange={e => setField('judgmentAmount', e.target.value)} placeholder="0" className={inputCls} />
              </FormField>
            </div>
          </div>

          {/* Legal Flags */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Legal Flags</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Toggle label="Preforeclosure" checked={form.preforeclosure} onChange={() => setField('preforeclosure', !form.preforeclosure)} />
              <Toggle label="Bankruptcy Filed" checked={form.bankruptcy} onChange={() => setField('bankruptcy', !form.bankruptcy)} />
              <Toggle label="Unclear Title" checked={form.unclearTitle} onChange={() => setField('unclearTitle', !form.unclearTitle)} />
              <Toggle label="Active Litigation" checked={form.activeLitigation} onChange={() => setField('activeLitigation', !form.activeLitigation)} />
              <Toggle label="Active Liens" checked={form.activeLiens} onChange={() => setField('activeLiens', !form.activeLiens)} />
              <Toggle label="Code Violations" checked={form.codeViolations} onChange={() => setField('codeViolations', !form.codeViolations)} />
              <Toggle label="Probate Signals" checked={form.probateSignals} onChange={() => setField('probateSignals', !form.probateSignals)} />
              <Toggle label="Failed Listing 90d" checked={form.failedListing90} onChange={() => setField('failedListing90', !form.failedListing90)} />
              <Toggle label="Surplus Req. Atty" checked={form.surplusRequiresAttorney} onChange={() => setField('surplusRequiresAttorney', !form.surplusRequiresAttorney)} />
            </div>
            <div className="mt-4">
              <FormField label="Auction Date (if scheduled)">
                <input type="date" value={form.auctionDate} onChange={e => setField('auctionDate', e.target.value)} className={inputCls} />
              </FormField>
            </div>
          </div>

          {/* Seller Motivation */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Seller Motivation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={`Motivation Score: ${form.sellerMotivation}/10`}>
                <input type="range" min="1" max="10" value={form.sellerMotivation} onChange={e => setField('sellerMotivation', parseInt(e.target.value))} className="w-full accent-blue-500" />
                <div className="flex justify-between text-xs text-slate-600 mt-0.5"><span>Not Motivated</span><span>Extremely Motivated</span></div>
              </FormField>
              <FormField label="Seller Timeline">
                <select value={form.sellerTimeline} onChange={e => setField('sellerTimeline', e.target.value)} className={selectCls}>
                  {TIMELINE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </select>
              </FormField>
            </div>
          </div>

          {/* Condition & Repairs */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Condition & Repairs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField label="Property Condition">
                <select value={form.propertyCondition} onChange={e => setField('propertyCondition', e.target.value)} className={selectCls}>
                  {CONDITION_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Repair Estimate ($)">
                <div className="flex gap-2">
                  <input type="number" value={form.repairEstimate} onChange={e => setField('repairEstimate', e.target.value)} placeholder="25000" className={inputCls} />
                  <button onClick={() => setShowRepairEstimator(!showRepairEstimator)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg whitespace-nowrap transition-colors">
                    {showRepairEstimator ? 'Hide' : 'Estimator'}
                  </button>
                </div>
              </FormField>
            </div>
            {showRepairEstimator && (
              <RepairEstimator
                sqft={parseFloat(form.sqft) || 1200}
                baths={parseFloat(form.baths) || 2}
                windows={parseInt(form.windows) || 10}
                onEstimateChange={v => setField('repairEstimate', v)}
              />
            )}
          </div>

          {/* Notes */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 text-sm">Notes</h3>
            <textarea
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              rows={3}
              placeholder="Additional details, observations, conversation notes..."
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !form.address}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-base"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Running AI Analysis with Web Search...</>
            ) : (
              <><Cpu size={18} /> Run Full Analysis</>
            )}
          </button>

          {loading && <AnalysisLoadingSkeleton />}
        </div>
      )}

      {/* CSV Upload tab */}
      {tab === 'csv' && (
        <div className="space-y-4">
          {csvStep === 'upload' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center space-y-4">
              <Upload size={32} className="text-blue-400 mx-auto" />
              <div>
                <h3 className="text-white font-semibold">Upload CSV Lead List</h3>
                <p className="text-slate-400 text-sm mt-1">Accepts PropStream, BatchSkipTracing, ListSource, and most formats</p>
              </div>
              <label className="inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                {csvLoading ? 'Uploading...' : 'Choose CSV File'}
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          )}
          {csvStep === 'map' && (
            <CSVMappingScreen
              csvHeaders={csvHeaders}
              autoMappings={autoMappings}
              onConfirm={handleMappingConfirm}
            />
          )}
          {csvStep === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Scored Leads</h3>
                <button onClick={() => { setCsvStep('upload'); setScoredLeads([]); }} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Upload New File</button>
              </div>
              <BatchLeadTable leads={scoredLeads} onSelectLead={handleSelectLead} />
            </div>
          )}
        </div>
      )}

      {/* API tab */}
      {tab === 'api' && (
        <ApiIntegrationCards />
      )}

      {/* Results */}
      {result && tab === 'manual' && (
        <div className="space-y-5 pt-2">
          <div className="border-t border-slate-700 pt-5">
            <h2 className="text-xl font-bold text-white mb-4">Analysis Results</h2>
          </div>

          {/* Scores */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex justify-around">
              <ScoreGauge score={result.distressScore} label="Distress Score" size={140} />
              <ScoreGauge score={result.equityScore} label="Equity Score" size={140} />
            </div>
            {result.rawEquity !== undefined && (
              <div className="mt-3 text-center text-sm text-slate-400">
                Raw Equity: <span className={`font-semibold ${result.rawEquity >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(Math.round(result.rawEquity)).toLocaleString()}{result.rawEquity < 0 ? ' (negative)' : ''}
                </span>
                {' '}({((result.equityPct || 0) * 100).toFixed(1)}%)
              </div>
            )}
          </div>

          {/* Verdict */}
          <VerdictBanner
            verdict={result.verdict}
            confidence={result.confidence}
            explanation={result.explanation}
            topRisk={result.top_risk}
          />

          {/* Red Flags */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3 text-sm">Red Flags</h3>
            <RedFlagBadges property={form} analysis={result} />
          </div>

          {/* ARV Validation */}
          {result.arv_validation && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3 text-sm">ARV Validation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Your ARV</div>
                  <div className="text-white font-semibold">${(result.arv_validation.user_arv || 0).toLocaleString()}</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Web Comp Median</div>
                  <div className="text-white font-semibold">{result.arv_validation.web_comp_median ? '$' + result.arv_validation.web_comp_median.toLocaleString() : 'N/A'}</div>
                </div>
                {result.arv_validation.deviation_pct !== null && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">Deviation</div>
                    <div className={`font-semibold ${Math.abs(result.arv_validation.deviation_pct) > 0.10 ? 'text-red-400' : 'text-green-400'}`}>
                      {(result.arv_validation.deviation_pct * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                <div className="md:col-span-3 bg-slate-900 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Assessment</div>
                  <div className="text-slate-300 text-xs">{result.arv_validation.assessment}</div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Cards */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Strategy Analysis</h3>
            {['Wholesale', 'BRRRR', 'Buy & Hold', 'Creative Finance'].map(s => (
              <StrategyCard key={s} strategy={s} propertyData={form} />
            ))}
          </div>

          {/* Buyer Auto-Match */}
          <BuyerMatchCard propertyData={{ ...form, condition: form.propertyCondition }} />

          {/* Foreclosure Analysis */}
          {(form.preforeclosure || form.bankruptcy || form.auctionDate) && (
            <ForeclosureAnalysis propertyData={{...form, allLiens: liens.reduce((s,l) => s + (parseFloat(l.amount)||0), 0)}} />
          )}

          {/* Surplus Funds Analysis */}
          {parseFloat(form.finalSalePrice) > 0 && (
            <SurplusFundsAnalysis propertyData={{...form, allLiens: liens.reduce((s,l) => s + (parseFloat(l.amount)||0), 0)}} />
          )}

          {/* Probate Analysis */}
          <ProbateAnalysis propertyData={form} />

          {/* Web Research */}
          {result.web_findings && result.web_findings.length > 0 && (
            <WebResearchCard findings={result.web_findings} />
          )}

          {/* Rate Sensitivity */}
          {rateSensData.length > 0 && parseFloat(form.rent) > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <RateSensitivityTable data={rateSensData} breakEvenRate={breakEven} />
            </div>
          )}

          {/* Missing Info */}
          {result.missing_info && result.missing_info.length > 0 && (
            <div className="bg-slate-800 border border-yellow-800 rounded-xl p-4">
              <h3 className="text-yellow-400 text-sm font-semibold mb-2">Missing / Unverified Data</h3>
              <ul className="space-y-1">
                {result.missing_info.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-yellow-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Market Trend Overlay */}
          {form.zip && (
            <MarketTrendOverlay zip={form.zip} county={form.county} state={form.state} />
          )}

          {/* State-Specific Rules */}
          {form.state && (
            <StateRulesCard state={form.state} analysisType="both" />
          )}

          {/* Outreach Templates quick-launch */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">Outreach Templates</div>
              <div className="text-slate-400 text-xs">Generate a letter or SMS for this lead</div>
            </div>
            <button
              onClick={() => setShowOutreach(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Open Templates
            </button>
          </div>

          <LegalDisclaimer />
        </div>
      )}

      {/* Outreach modal */}
      {showOutreach && (
        <OutreachTemplates propertyData={form} onClose={() => setShowOutreach(false)} />
      )}
    </div>
  )
}
