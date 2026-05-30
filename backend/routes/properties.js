import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const { verdict, leadStage, followUpStatus, minDistress, minEquity, search, sort = 'createdAt', order = 'desc' } = req.query;

    const where = {};
    if (verdict) where.finalVerdict = { contains: verdict, mode: 'insensitive' };
    if (leadStage) where.leadStage = leadStage;
    if (followUpStatus) where.followUpStatus = followUpStatus;
    if (minDistress) where.distressScore = { gte: parseInt(minDistress) };
    if (minEquity) where.equityScore = { gte: parseInt(minEquity) };
    if (search) {
      where.OR = [
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { county: { contains: search, mode: 'insensitive' } },
        { zip: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } }
      ];
    }

    const validSorts = ['createdAt', 'distressScore', 'equityScore', 'auctionDate', 'updatedAt'];
    const orderBy = { [validSorts.includes(sort) ? sort : 'createdAt']: order === 'asc' ? 'asc' : 'desc' };

    const properties = await prisma.property.findMany({ where, orderBy });
    res.json(properties);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
});

router.get('/export/csv', async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({ orderBy: { createdAt: 'desc' } });
    const headers = ['id', 'address', 'city', 'state', 'county', 'zip', 'arv', 'askPrice', 'mortgageBalance', 'repairEstimate', 'distressScore', 'equityScore', 'finalVerdict', 'confidence', 'leadStage', 'followUpStatus', 'primaryStrategy', 'createdAt'];
    const rows = properties.map(p => headers.map(h => {
      const val = p[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="track-dealos-leads.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const allowed = ['followUpStatus', 'leadStage', 'notes', 'tags', 'offerHistory', 'actualNumbers', 'auctionDate', 'primaryStrategy'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.body.auctionDate) data.auctionDate = new Date(req.body.auctionDate);
    const property = await prisma.property.update({ where: { id: req.params.id }, data });
    res.json(property);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
