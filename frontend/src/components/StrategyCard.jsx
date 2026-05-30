import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  calcMAO, calcHoldingCosts, calcBRRRR, calcBuyAndHold,
  calcMortgagePayment, applyScenario
} from '../lib/formulas.js'
import {
  getWholesaleVerdict, getBRRRRVerdict, getRentalVerdict
} from '../lib/scoring.js'

const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '$0'
  const abs = Math.abs(Math.round(n))
  const str = '$' + abs.toLocaleString()
  return n < 0 ? '-' + str : str
}

const pct = (n) => (n * 100).toFixed(1) + '%'

export default function StrategyCard({ strategy, propertyData = {} }) {
  const [open, setOpen] = useState(false)
  const [scenario, setScenario] = useState('realistic')

  const {
    arv = 0, repairEstimate = 0, askPrice = 0, mortgageBalance = 0,
    rent = 0, interestRate = 7.0, sqft = 1200,
    annualTax = 2400, annualInsurance = 1200,
    vacancyRate = 0.08, mgmtRate = 0.08, holdingDays = 60
  } = propertyData

  const { adjustedArv, adjustedRepairs } = applyScenario(arv, repairEstimate, scenario)
  const assignmentFee = 8000
  const holdCosts = calcHoldingCosts(annualTax, annualInsurance, holdingDays)
  const mao = calcMAO(adjustedArv, adjustedRepairs, assignmentFee, holdCosts, scenario)
  const margin = mao - (askPrice || 0)

  const purchaseForBRRRR = askPrice || mao
  const brrrr = calcBRRRR(purchaseForBRRRR, adjustedRepairs, rent, adjustedArv, vacancyRate, mgmtRate, calcMortgagePayment(purchaseForBRRRR * 0.75, interestRate, 30))
  const day1Pct = brrrr.allIn > 0 ? brrrr.day1CashLeft / brrrr.allIn : 1
  const brrrrVerdict = getBRRRRVerdict(day1Pct, brrrr.monthlyCF)

  const totalCash = (purchaseForBRRRR * 0.20) + adjustedRepairs + holdCosts + (purchaseForBRRRR * 0.03)
  const bhResult = calcBuyAndHold(rent, annualTax, annualInsurance, vacancyRate, mgmtRate, calcMortgagePayment(purchaseForBRRRR * 0.80, interestRate, 30), purchaseForBRRRR, totalCash)
  const rentalVerdict = getRentalVerdict(bhResult.coc, bhResult.cashFlow)

  const scenarioTabs = ['best', 'realistic', 'worst']
  const verdictColors = {
    'Strong Wholesale': 'text-green-400', 'Thin Wholesale': 'text-yellow-400',
    'Not Wholesaleable': 'text-red-400', 'Dead Deal': 'text-red-600',
    'Strong': 'text-green-400', 'Thin': 'text-yellow-400', 'Bad': 'text-red-400',
    'Lender-Dependent': 'text-yellow-400', 'Good Rental': 'text-green-400',
    'Break-Even': 'text-yellow-400', 'Negative Cash Flow': 'text-red-400'
  }

  const strategyIcons = { Wholesale: '🏷️', BRRRR: '🔄', 'Buy & Hold': '🏠', 'Creative Finance': '💡' }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{strategyIcons[strategy] || '📋'}</span>
          <span className="font-semibold text-white">{strategy}</span>
          {strategy === 'Wholesale' && (
            <span className={`text-xs font-bold ml-2 ${verdictColors[getWholesaleVerdict(margin, mao < 0)] || 'text-slate-400'}`}>
              {getWholesaleVerdict(margin, mao < 0)}
            </span>
          )}
          {strategy === 'BRRRR' && (
            <span className={`text-xs font-bold ml-2 ${verdictColors[brrrrVerdict] || 'text-slate-400'}`}>{brrrrVerdict}</span>
          )}
          {strategy === 'Buy & Hold' && (
            <span className={`text-xs font-bold ml-2 ${verdictColors[rentalVerdict] || 'text-slate-400'}`}>{rentalVerdict}</span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-slate-700 px-4 py-4 space-y-4">
          {/* Scenario tabs */}
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg w-fit">
            {scenarioTabs.map(s => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-all ${
                  scenario === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {strategy === 'Wholesale' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Adjusted ARV</div>
                <div className="text-white font-semibold">{fmt(adjustedArv)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">MAO ({scenario})</div>
                <div className={`font-semibold ${mao < 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(mao)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Assignment Fee</div>
                <div className="text-white font-semibold">{fmt(assignmentFee)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Spread vs Ask</div>
                <div className={`font-semibold ${margin < 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(margin)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Adjusted Repairs</div>
                <div className="text-white font-semibold">{fmt(adjustedRepairs)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Holding Costs</div>
                <div className="text-white font-semibold">{fmt(holdCosts)}</div>
              </div>
            </div>
          )}

          {strategy === 'BRRRR' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">All-In Cost</div>
                <div className="text-white font-semibold">{fmt(brrrr.allIn)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Day-1 Refi (75%)</div>
                <div className="text-white font-semibold">{fmt(brrrr.day1Refi)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Cash Left In</div>
                <div className={`font-semibold ${brrrr.day1CashLeft < 0 ? 'text-green-400' : 'text-yellow-400'}`}>{fmt(brrrr.day1CashLeft)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Monthly CF</div>
                <div className={`font-semibold ${brrrr.monthlyCF >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(brrrr.monthlyCF)}/mo</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Seasoned Refi</div>
                <div className="text-white font-semibold">{fmt(brrrr.seasonedRefi)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Cash Left (Seasoned)</div>
                <div className={`font-semibold ${brrrr.seasonedCashLeft < 0 ? 'text-green-400' : 'text-yellow-400'}`}>{fmt(brrrr.seasonedCashLeft)}</div>
              </div>
            </div>
          )}

          {strategy === 'Buy & Hold' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Monthly NOI</div>
                <div className={`font-semibold ${bhResult.noiMonthly >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(bhResult.noiMonthly)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Cash Flow</div>
                <div className={`font-semibold ${bhResult.cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(bhResult.cashFlow)}/mo</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">CoC Return</div>
                <div className={`font-semibold ${bhResult.coc >= 8 ? 'text-green-400' : bhResult.coc >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>{bhResult.coc.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Cap Rate</div>
                <div className="text-white font-semibold">{bhResult.capRate.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Monthly Mgmt</div>
                <div className="text-white font-semibold">{fmt(bhResult.monthlyMgmt)}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400 text-xs mb-1">Monthly CapEx</div>
                <div className="text-white font-semibold">{fmt(bhResult.monthlyCapex)}</div>
              </div>
            </div>
          )}

          {strategy === 'Creative Finance' && (
            <div className="space-y-2 text-sm text-slate-300">
              <p>Subject-To Analysis:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Existing Mortgage</div>
                  <div className="text-white font-semibold">{fmt(mortgageBalance)}</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="text-slate-400 text-xs mb-1">Seller Equity</div>
                  <div className="text-white font-semibold">{fmt(arv - mortgageBalance - repairEstimate)}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Creative finance structures (subject-to, seller finance, lease-option) require consultation with a real estate attorney. Verify due-on-sale clause risk.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
