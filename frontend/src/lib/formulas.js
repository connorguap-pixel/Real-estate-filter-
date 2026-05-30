// Wholesale
export function calcMAO(arv, repairs, assignmentFee, holdingCosts, scenario) {
  const pcts = { best: 0.75, realistic: 0.70, worst: 0.65 };
  return (arv * pcts[scenario]) - repairs - assignmentFee - holdingCosts;
}

export function calcHoldingCosts(annualTax, annualInsurance, holdingDays) {
  return (annualTax / 365 + annualInsurance / 365 + 75) * holdingDays;
}

// BRRRR
export function calcBRRRR(purchase, rehab, rent, arv, vacancyRate, mgmtRate, mortgagePayment) {
  const allIn = purchase + rehab + (purchase * 0.03) + calcHoldingCosts(0, 0, 90);
  const day1Refi = Math.min(arv * 0.75, allIn * 0.75);
  const seasonedRefi = arv * 0.75;
  const day1CashLeft = allIn - day1Refi;
  const seasonedCashLeft = allIn - seasonedRefi;
  const monthlyCF = rent - mortgagePayment - (rent * vacancyRate) - (rent * 0.05) - (rent * mgmtRate) - (rent * 0.05);
  return { allIn, day1Refi, seasonedRefi, day1CashLeft, seasonedCashLeft, monthlyCF };
}

// Buy & Hold
export function calcBuyAndHold(rent, annualTax, annualInsurance, vacancyRate, mgmtRate, mortgagePayment, purchasePrice, totalCashInvested) {
  const monthlyTax = annualTax / 12;
  const monthlyIns = annualInsurance / 12;
  const monthlyVacancy = rent * vacancyRate;
  const monthlyCapex = rent * 0.05;
  const monthlyMgmt = rent * mgmtRate;
  const monthlyRepairs = rent * 0.05;
  const noiMonthly = rent - monthlyTax - monthlyIns - monthlyVacancy - monthlyCapex - monthlyMgmt - monthlyRepairs;
  const cashFlow = noiMonthly - mortgagePayment;
  const coc = totalCashInvested > 0 ? (cashFlow * 12) / totalCashInvested * 100 : 0;
  const capRate = purchasePrice > 0 ? (noiMonthly * 12) / purchasePrice * 100 : 0;
  return { noiMonthly, cashFlow, coc, capRate, monthlyTax, monthlyIns, monthlyVacancy, monthlyCapex, monthlyMgmt, monthlyRepairs };
}

// Three scenarios modifier
export function applyScenario(arv, repairs, scenario) {
  const mods = {
    best: { arvMult: 1.07, repairMult: 0.85 },
    realistic: { arvMult: 1.00, repairMult: 1.00 },
    worst: { arvMult: 0.88, repairMult: 1.25 }
  };
  return {
    adjustedArv: arv * mods[scenario].arvMult,
    adjustedRepairs: repairs * mods[scenario].repairMult
  };
}

// Mortgage payment
export function calcMortgagePayment(principal, annualRate, termYears) {
  if (!principal || !annualRate) return 0;
  const r = annualRate / 12 / 100;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
}

// Rate sensitivity
export function calcRateSensitivity(principal, baseRate, termYears, rent, vacancyRate, mgmtRate, annualTax, annualInsurance) {
  return [0, 0.5, 1.0, 1.5].map(bump => {
    const rate = baseRate + bump;
    const payment = calcMortgagePayment(principal, rate, termYears);
    const { cashFlow } = calcBuyAndHold(rent, annualTax, annualInsurance, vacancyRate, mgmtRate, payment, 0, 1);
    return { rate, payment, cashFlow };
  });
}

// Break-even rate (binary search)
export function calcBreakEvenRate(principal, termYears, rent, vacancyRate, mgmtRate, annualTax, annualInsurance) {
  let lo = 0, hi = 30;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const payment = calcMortgagePayment(principal, mid, termYears);
    const { cashFlow } = calcBuyAndHold(rent, annualTax, annualInsurance, vacancyRate, mgmtRate, payment, 0, 1);
    if (cashFlow > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Repair estimator items
export const REPAIR_ITEMS = [
  { key: 'roof', label: 'Roof replacement', low: 8000, high: 18000, unit: 'flat' },
  { key: 'hvac', label: 'HVAC replacement', low: 5000, high: 12000, unit: 'flat' },
  { key: 'foundation', label: 'Foundation issues', low: 8000, high: 30000, unit: 'flat' },
  { key: 'plumb', label: 'Full replumb', low: 4000, high: 12000, unit: 'flat' },
  { key: 'rewire', label: 'Full rewire', low: 6000, high: 15000, unit: 'flat' },
  { key: 'kitchen', label: 'Kitchen gut', low: 15000, high: 35000, unit: 'flat' },
  { key: 'bathroom', label: 'Bathroom reno', low: 6000, high: 15000, unit: 'per bath' },
  { key: 'flooring', label: 'Flooring replacement', low: 3, high: 8, unit: 'per sqft' },
  { key: 'windows', label: 'Window replacement', low: 300, high: 600, unit: 'per window' },
  { key: 'paint', label: 'Interior paint', low: 1.5, high: 3.0, unit: 'per sqft' },
  { key: 'landscape', label: 'Landscaping cleanup', low: 1500, high: 5000, unit: 'flat' },
  { key: 'cosmetic', label: 'Cosmetic only', low: 5, high: 15, unit: 'per sqft' },
];

export function calcRepairTotal(selectedItems, sqft, baths, windows = 10) {
  let low = 0, high = 0;
  selectedItems.forEach(item => {
    let multiplier = 1;
    if (item.unit === 'per sqft') multiplier = sqft || 1000;
    else if (item.unit === 'per bath') multiplier = baths || 2;
    else if (item.unit === 'per window') multiplier = windows;
    low += item.low * multiplier;
    high += item.high * multiplier;
  });
  return { low, high, realistic: Math.round((low + high) / 2) };
}

export function fmt(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0';
  return '$' + Math.round(num).toLocaleString();
}
