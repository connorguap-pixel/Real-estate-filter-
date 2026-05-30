export function calcDistressScore(property) {
  let score = 0;
  if (property.preforeclosure) score += 20;
  if (property.auctionDate) {
    const days = Math.floor((new Date(property.auctionDate) - new Date()) / 86400000);
    if (days >= 0 && days <= 30) score += 15;
  }
  if (property.taxDelinquency > 0) score += 15;
  if (property.vacant) score += 10;
  if ((property.sellerMotivation || 0) >= 8) score += 10;
  if (property.probateSignals) score += 10;
  if (property.absenteeOwner) score += 8;
  if (property.failedListing90) score += 8;
  if (property.activeLiens) score += 8;
  if (property.codeViolations) score += 7;
  if ((property.ownershipYears || 0) >= 20) score += 5;
  return Math.min(100, score);
}

export function calcEquityScore(property) {
  const { arv = 0, mortgageBalance = 0, allLiens = 0, repairEstimate = 0,
          irsLien = false, hoaLien = false, unclearTitle = false, bankruptcy = false } = property;
  const rawEquity = arv - mortgageBalance - allLiens - repairEstimate - (arv * 0.08);
  const equityPct = arv > 0 ? rawEquity / arv : 0;

  let baseScore;
  if (equityPct >= 0.40) baseScore = Math.min(100, 80 + (equityPct - 0.40) * 100);
  else if (equityPct >= 0.25) baseScore = 60 + (equityPct - 0.25) * 133;
  else if (equityPct >= 0.10) baseScore = 35 + (equityPct - 0.10) * 167;
  else baseScore = Math.max(0, equityPct * 350);

  if (irsLien) baseScore -= 20;
  if (hoaLien) baseScore -= 10;
  if (unclearTitle) baseScore -= 15;
  if (bankruptcy) baseScore -= 20;

  return { score: Math.max(0, Math.min(100, Math.round(baseScore))), rawEquity, equityPct };
}

export function getDistressLabel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function getWholesaleVerdict(realisticMargin, worstSpreadNegative) {
  if (worstSpreadNegative) return 'Dead Deal';
  if (realisticMargin >= 20000) return 'Strong Wholesale';
  if (realisticMargin >= 8000) return 'Thin Wholesale';
  return 'Not Wholesaleable';
}

export function getBRRRRVerdict(day1CashLeftPct, monthlyCF) {
  if (day1CashLeftPct < 0.20 && monthlyCF > 0) return 'Strong';
  if (day1CashLeftPct <= 0.35) return 'Thin';
  if (monthlyCF < 0) return 'Bad';
  return 'Lender-Dependent';
}

export function getRentalVerdict(coc, monthlyCF) {
  if (coc >= 8 && monthlyCF > 0) return 'Good Rental';
  if (coc >= 2) return 'Break-Even';
  return 'Negative Cash Flow';
}
