export const STATE_FORECLOSURE_RULES = {
  NJ: {
    process: 'judicial',
    avgDays: 1100,
    redemptionPeriod: 'None after sheriff sale',
    surplusRules: 'Surplus funds go to junior lienholders first, then owner. Owner must petition court.',
    auctionType: 'Sheriff Sale',
    notes: 'NJ has one of the longest foreclosure timelines in the US. Strong tenant protections. Deed in lieu common.'
  },
  NY: {
    process: 'judicial',
    avgDays: 1000,
    redemptionPeriod: 'None after judgment of foreclosure and sale',
    surplusRules: 'Surplus paid into court. Claimants file motion. Owner gets remainder after liens satisfied.',
    auctionType: 'Referee Sale',
    notes: 'NYC has additional tenant protections. Lis pendens filed early — check for these in title search.'
  },
  FL: {
    process: 'judicial',
    avgDays: 600,
    redemptionPeriod: 'None after certificate of title issued',
    surplusRules: 'Clerk holds surplus. Owner has 60 days to claim before state takes it.',
    auctionType: 'Online Auction (Realauction.com)',
    notes: 'FL surplus funds are a key opportunity. Homestead exemption does NOT apply to forced sale by non-purchase money lenders.'
  },
  TX: {
    process: 'non-judicial (deed of trust)',
    avgDays: 60,
    redemptionPeriod: 'None for most properties (180 days for agricultural)',
    surplusRules: 'Trustee holds surplus. Mortgagor must claim within 2 years.',
    auctionType: 'Courthouse Steps (first Tuesday each month)',
    notes: 'Fastest foreclosure state. No redemption on residential. Strong homestead protections for other collection actions.'
  },
  CA: {
    process: 'non-judicial (deed of trust) or judicial',
    avgDays: 200,
    redemptionPeriod: '3 months after trustee sale (if shortfall) or none',
    surplusRules: 'Trustee must hold surplus. Owner has 1 year to claim.',
    auctionType: 'Trustee Sale',
    notes: 'One-action rule and anti-deficiency protections. SB1079 gives tenants right of first refusal at trustee sale.'
  },
  PA: {
    process: 'judicial',
    avgDays: 500,
    redemptionPeriod: 'None after sheriff sale confirmation',
    surplusRules: 'Sheriff distributes surplus per lien priority. Owner gets remainder.',
    auctionType: 'Sheriff Sale',
    notes: 'Act 6 notice requirements. Philadelphia has additional municipal court steps. Upset price sets minimum bid.'
  }
};

export function getStateRule(stateCode) {
  return STATE_FORECLOSURE_RULES[stateCode?.toUpperCase()] || null;
}
