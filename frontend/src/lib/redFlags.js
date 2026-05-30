export function detectRedFlags(property, analysis) {
  const hardBlockers = [];
  const dealKillers = [];
  const cautions = [];

  if (property.bankruptcy) hardBlockers.push('Bankruptcy Filed');
  if (property.irsLien) hardBlockers.push('IRS Federal Tax Lien');
  if (property.unclearTitle) hardBlockers.push('Clouded Title');
  if (property.activeLitigation) hardBlockers.push('Active Litigation');

  if ((analysis?.equityScore || 0) < 20) dealKillers.push('No Equity (Score < 20)');
  if (analysis?.allMAOsNegative) dealKillers.push('Negative Spread — All 3 MAO Scenarios');
  if ((property.repairEstimate || 0) > (property.arv || 0) * 0.35) dealKillers.push('Excessive Repairs > 35% ARV');

  if ((analysis?.arv_validation?.deviation_pct || 0) > 0.10) cautions.push('ARV Deviates >10% from Web Comps');
  if ((property.askPrice || 0) > (property.arv || 0) * 0.90) cautions.push('Seller Asking > 90% ARV');
  if ((property.estimatedAvm || 0) > (property.arv || 0) * 1.10) cautions.push('Inflated AVM >10% Above ARV');
  if (property.hoaLien) cautions.push('HOA / Municipal Lien Present');
  if (property.surplusRequiresAttorney) cautions.push('Surplus Claim Requires Attorney');

  return { hardBlockers, dealKillers, cautions };
}
