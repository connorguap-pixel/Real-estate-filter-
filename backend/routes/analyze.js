import express from 'express';
import { PrismaClient } from '@prisma/client';
import { runVerdictAnalysis } from '../services/anthropicClient.js';
import { parseWebFindings } from '../services/webSearchParser.js';

const router = express.Router();
const prisma = new PrismaClient();

function calcDistressScore(property) {
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

function calcEquityScore(property) {
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

router.post('/', async (req, res, next) => {
  try {
    const propertyData = req.body;

    const distressScore = calcDistressScore(propertyData);
    const equityResult = calcEquityScore(propertyData);

    const calculatedScores = {
      distressScore,
      equityScore: equityResult.score,
      rawEquity: equityResult.rawEquity,
      equityPct: equityResult.equityPct,
      arv: propertyData.arv || 0
    };

    const aiVerdict = await runVerdictAnalysis(propertyData, calculatedScores);

    const analysisJson = {
      ...calculatedScores,
      ...aiVerdict,
      propertyData,
      analyzedAt: new Date().toISOString()
    };

    const webFindings = aiVerdict.web_findings || [];

    // Optionally save to DB
    let savedProperty = null;
    if (propertyData.address && propertyData.city && propertyData.state) {
      try {
        savedProperty = await prisma.property.create({
          data: {
            address: propertyData.address,
            city: propertyData.city,
            state: propertyData.state,
            county: propertyData.county || '',
            zip: propertyData.zip || '',
            owner: propertyData.owner || null,
            arv: propertyData.arv ? parseFloat(propertyData.arv) : null,
            askPrice: propertyData.askPrice ? parseFloat(propertyData.askPrice) : null,
            mortgageBalance: propertyData.mortgageBalance ? parseFloat(propertyData.mortgageBalance) : null,
            repairEstimate: propertyData.repairEstimate ? parseFloat(propertyData.repairEstimate) : null,
            primaryStrategy: aiVerdict.strategy_ranking?.[0] || null,
            distressScore,
            equityScore: equityResult.score,
            finalVerdict: aiVerdict.verdict || '',
            confidence: aiVerdict.confidence || 'low',
            auctionDate: propertyData.auctionDate ? new Date(propertyData.auctionDate) : null,
            analysisJson,
            webFindings: webFindings,
            tags: []
          }
        });
      } catch (dbErr) {
        console.warn('Could not save to DB:', dbErr.message);
      }
    }

    res.json({
      success: true,
      propertyId: savedProperty?.id || null,
      distressScore,
      equityScore: equityResult.score,
      rawEquity: equityResult.rawEquity,
      equityPct: equityResult.equityPct,
      verdict: aiVerdict.verdict,
      confidence: aiVerdict.confidence,
      explanation: aiVerdict.explanation,
      top_risk: aiVerdict.top_risk,
      missing_info: aiVerdict.missing_info,
      strategy_ranking: aiVerdict.strategy_ranking,
      web_findings: webFindings,
      arv_validation: aiVerdict.arv_validation,
      analysisJson
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id }
    });
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

export default router;
