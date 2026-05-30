import dotenv from 'dotenv';
dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const ANALYST_SYSTEM_PROMPT = `You are a ruthless real estate acquisitions analyst with 20 years of distressed property experience.
You think in worst-case scenarios. You never hype deals. You are blunt and direct.
You have web search — USE IT before issuing any verdict. Search for:
- Recent comps (last 6 months) in the subject ZIP to validate the user's ARV
- Current rental rates for the bed/bath count in that ZIP
- Any active foreclosure or auction status if the property is flagged preforeclosure
- Market conditions: vacancy, cap rates, days on market for that county

Never trust user-entered AVM or Zestimate values without web verification.
If web search returns no usable comps, say so explicitly in missing_info.

Always explain: why the deal is good or bad, the single biggest risk, what data is missing, strategy ranking.

Respond ONLY in valid JSON with no markdown fencing:
{
  "verdict": string,
  "confidence": "high" | "medium" | "low",
  "explanation": string,
  "top_risk": string,
  "missing_info": string[],
  "strategy_ranking": string[],
  "web_findings": string[],
  "arv_validation": {
    "user_arv": number,
    "web_comp_median": number | null,
    "deviation_pct": number | null,
    "assessment": string
  }
}`;

function buildAnalysisPrompt(propertyData, scores) {
  const {
    address, city, state, county, zip,
    arv, askPrice, mortgageBalance, repairEstimate,
    beds, baths, sqft, yearBuilt, propertyType,
    rent, preforeclosure, auctionDate, taxDelinquency,
    vacant, absenteeOwner, bankruptcy, irsLien, hoaLien,
    unclearTitle, activeLiens, sellerMotivation
  } = propertyData;

  return `Analyze this distressed property deal:

PROPERTY: ${address}, ${city}, ${state} ${zip} (${county} County)
TYPE: ${propertyType || 'SFR'} | ${beds || '?'}bd/${baths || '?'}ba | ${sqft || '?'} sqft | Built ${yearBuilt || '?'}

FINANCIALS:
- ARV (user-entered): $${(arv || 0).toLocaleString()}
- Seller Asking: $${(askPrice || 0).toLocaleString()}
- Mortgage Balance: $${(mortgageBalance || 0).toLocaleString()}
- Repair Estimate: $${(repairEstimate || 0).toLocaleString()}
- Rent Estimate: $${(rent || 0).toLocaleString()}/mo

DISTRESS SIGNALS:
- Preforeclosure: ${preforeclosure ? 'YES' : 'No'}
- Auction Date: ${auctionDate || 'None'}
- Tax Delinquency: ${taxDelinquency ? '$' + taxDelinquency.toLocaleString() : 'None'}
- Vacant: ${vacant ? 'YES' : 'No'}
- Absentee Owner: ${absenteeOwner ? 'YES' : 'No'}
- Seller Motivation: ${sellerMotivation || 'Unknown'}/10

LEGAL FLAGS:
- Bankruptcy: ${bankruptcy ? 'YES - AUTOMATIC STAY ACTIVE' : 'No'}
- IRS Lien: ${irsLien ? 'YES' : 'No'}
- HOA Lien: ${hoaLien ? 'YES' : 'No'}
- Unclear Title: ${unclearTitle ? 'YES' : 'No'}
- Active Liens: ${activeLiens ? 'YES' : 'No'}

CALCULATED SCORES:
- Distress Score: ${scores.distressScore}/100
- Equity Score: ${scores.equityScore}/100
- Raw Equity: $${(scores.rawEquity || 0).toLocaleString()}
- Equity %: ${((scores.equityPct || 0) * 100).toFixed(1)}%

Search for recent comps in ZIP ${zip} and current market conditions in ${county} County, ${state}.
Then issue your JSON verdict.`;
}

function buildFallbackVerdict(scores) {
  const { distressScore, equityScore } = scores;
  const combined = distressScore + equityScore;

  let verdict, confidence, explanation, topRisk;

  if (combined >= 140) {
    verdict = 'Strong Deal — Recommend Full Analysis';
    confidence = 'medium';
    explanation = 'High distress and equity scores indicate a potentially strong acquisition opportunity. Web verification unavailable — proceed with due diligence.';
    topRisk = 'Unable to verify ARV or market conditions via web search. Validate comps independently before proceeding.';
  } else if (combined >= 90) {
    verdict = 'Marginal Deal — Proceed With Caution';
    confidence = 'low';
    explanation = 'Moderate combined scores. Deal may work at the right price point but margins are thin.';
    topRisk = 'Thin margins leave little room for error. Verify all inputs carefully.';
  } else {
    verdict = 'Pass — Insufficient Distress or Equity';
    confidence = 'medium';
    explanation = 'Low combined distress and equity scores indicate this deal does not meet minimum acquisition criteria.';
    topRisk = 'Insufficient equity cushion to absorb deal costs and generate acceptable returns.';
  }

  return {
    verdict,
    confidence,
    explanation,
    top_risk: topRisk,
    missing_info: ['Web search unavailable — ARV not verified', 'Market comp data not retrieved', 'Rental rate data not verified'],
    strategy_ranking: combined >= 120 ? ['Wholesale', 'BRRRR', 'Buy & Hold'] : ['Pass'],
    web_findings: [],
    arv_validation: {
      user_arv: scores.arv || 0,
      web_comp_median: null,
      deviation_pct: null,
      assessment: 'Web verification unavailable — manually verify ARV with recent MLS comps'
    }
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runMarketTrendSearch(zip, county, state) {
  if (!ANTHROPIC_API_KEY) {
    return { appreciation12mo: null, avgDaysOnMarket: null, activeListings: null, soldLast90: null, investorActivity: 'Unknown', note: 'API key not configured' };
  }

  const prompt = `Search for current real estate market trends in ZIP code ${zip}${county ? `, ${county} County` : ''}${state ? `, ${state}` : ''}.

Find and return:
1. 12-month home price appreciation or depreciation percentage
2. Average days on market for recent sales
3. Number of active listings vs. homes sold in last 90 days
4. Overall investor activity level (Hot / Normal / Slow) based on cash sale volume and investor purchases

Respond ONLY in valid JSON (no markdown):
{
  "appreciation12mo": number or null,
  "avgDaysOnMarket": number or null,
  "activeListings": number or null,
  "soldLast90": number or null,
  "investorActivity": "Hot" | "Normal" | "Slow" | "Unknown",
  "note": string
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: 'You are a real estate market data researcher. Search for factual market data and respond in JSON only.',
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    if (!textBlocks.length) throw new Error('No text');
    let raw = textBlocks[textBlocks.length - 1].text;
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(raw);
  } catch {
    return { appreciation12mo: null, avgDaysOnMarket: null, activeListings: null, soldLast90: null, investorActivity: 'Unknown', note: 'Could not retrieve market data' };
  }
}

export async function runVerdictAnalysis(propertyData, calculatedScores) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using fallback verdict');
    return buildFallbackVerdict(calculatedScores);
  }

  const prompt = buildAnalysisPrompt(propertyData, calculatedScores);
  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await sleep(Math.pow(2, attempt) * 1000);
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: ANALYST_SYSTEM_PROMPT,
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search',
              max_uses: 5
            }
          ],
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      const textBlocks = (data.content || []).filter(b => b.type === 'text');
      if (textBlocks.length === 0) {
        throw new Error('No text content in response');
      }

      let rawText = textBlocks[textBlocks.length - 1].text;
      rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

      const parsed = JSON.parse(rawText);
      return parsed;

    } catch (err) {
      lastError = err;
      console.error(`Anthropic attempt ${attempt + 1} failed:`, err.message);
    }
  }

  console.error('All Anthropic retries exhausted, using fallback:', lastError?.message);
  return buildFallbackVerdict(calculatedScores);
}
