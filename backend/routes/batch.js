import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function calcDistressScore(property) {
  let score = 0;
  if (property.preforeclosure || property['in foreclosure'] === 'true' || property['pre-foreclosure'] === 'true') score += 20;
  if (property.auctionDate) {
    const days = Math.floor((new Date(property.auctionDate) - new Date()) / 86400000);
    if (days >= 0 && days <= 30) score += 15;
  }
  const taxDel = parseFloat(property.taxDelinquency || property['delinquent taxes'] || 0);
  if (taxDel > 0) score += 15;
  if (property.vacant === 'true' || property.vacant === true) score += 10;
  if ((parseFloat(property.sellerMotivation) || 0) >= 8) score += 10;
  if (property.absenteeOwner === 'true' || property.absenteeOwner === true) score += 8;
  if (property.activeLiens === 'true' || property.activeLiens === true) score += 8;
  return Math.min(100, score);
}

function calcEquityScore(property) {
  const arv = parseFloat(property.arv || property.estimatedValue || property.avm || 0);
  const mortgage = parseFloat(property.mortgageBalance || property['open mortgage balance'] || 0);
  const repairs = parseFloat(property.repairEstimate || 0);
  const allLiens = parseFloat(property.allLiens || 0);

  const rawEquity = arv - mortgage - allLiens - repairs - (arv * 0.08);
  const equityPct = arv > 0 ? rawEquity / arv : 0;

  let baseScore;
  if (equityPct >= 0.40) baseScore = Math.min(100, 80 + (equityPct - 0.40) * 100);
  else if (equityPct >= 0.25) baseScore = 60 + (equityPct - 0.25) * 133;
  else if (equityPct >= 0.10) baseScore = 35 + (equityPct - 0.10) * 167;
  else baseScore = Math.max(0, equityPct * 350);

  if (property.irsLien) baseScore -= 20;
  if (property.hoaLien) baseScore -= 10;
  if (property.unclearTitle) baseScore -= 15;
  if (property.bankruptcy) baseScore -= 20;

  return { score: Math.max(0, Math.min(100, Math.round(baseScore))), rawEquity, equityPct };
}

const FIELD_MAP = {
  bedrooms: ['beds', 'bedrooms', 'br', 'bed count'],
  bathrooms: ['baths', 'bathrooms', 'ba', 'bath count'],
  estimatedValue: ['est value', 'estimated value', 'avm', 'zillow estimate'],
  mortgageBalance: ['open mortgage balance', 'mortgage balance', 'loan balance', 'est mortgage balance'],
  preforeclosure: ['preforeclosure', 'pre-fc', 'pre-foreclosure', 'in foreclosure'],
  taxDelinquency: ['tax delinquent', 'delinquent taxes', 'tax default', 'back taxes'],
  absenteeOwner: ['absentee owner', 'absentee', 'non-owner occupied'],
  equity: ['equity', 'estimated equity', 'est equity'],
  lastSaleDate: ['last sale date', 'prior sale date', 'deed date'],
};

function autoMapColumns(csvHeaders) {
  const mappings = {};
  csvHeaders.forEach(header => {
    const lower = header.toLowerCase().trim();
    for (const [systemField, variants] of Object.entries(FIELD_MAP)) {
      if (variants.includes(lower)) {
        mappings[header] = systemField;
        break;
      }
    }
  });
  return mappings;
}

router.post('/score', async (req, res, next) => {
  try {
    const { leads } = req.body;
    if (!Array.isArray(leads)) return res.status(400).json({ error: 'leads must be an array' });

    const scored = leads.map(lead => {
      const distressScore = calcDistressScore(lead);
      const equityResult = calcEquityScore(lead);
      const combined = distressScore + equityResult.score;
      let tier = 'cold';
      if (combined >= 140) tier = 'hot';
      else if (combined >= 90) tier = 'warm';

      const flags = [];
      if (lead.bankruptcy === 'true' || lead.bankruptcy === true) flags.push('Bankruptcy');
      if (lead.irsLien === 'true' || lead.irsLien === true) flags.push('IRS Lien');
      if (lead.preforeclosure === 'true' || lead.preforeclosure === true) flags.push('Preforeclosure');

      let topStrategy = 'Pass';
      if (combined >= 140) topStrategy = 'Wholesale';
      else if (combined >= 100) topStrategy = 'Creative Finance';

      return { ...lead, distressScore, equityScore: equityResult.score, combined, tier, topFlags: flags, topStrategy };
    });

    scored.sort((a, b) => b.combined - a.combined);
    res.json({ success: true, leads: scored });
  } catch (err) {
    next(err);
  }
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'CSV too short' });

    // Simple CSV parser
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });
      return row;
    }).filter(row => Object.values(row).some(v => v));

    const autoMappings = autoMapColumns(headers);

    res.json({ success: true, headers, rows: rows.slice(0, 1000), autoMappings, totalRows: rows.length });
  } catch (err) {
    next(err);
  }
});

export default router;
