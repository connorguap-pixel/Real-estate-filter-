import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendAuctionAlert, sendTestEmail } from '../services/emailService.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/test-email', async (req, res, next) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'to email required' });
    await sendTestEmail(to);
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    next(err);
  }
});

router.get('/upcoming-auctions', async (req, res, next) => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const properties = await prisma.property.findMany({
      where: {
        auctionDate: { gte: now, lte: cutoff }
      },
      orderBy: { auctionDate: 'asc' }
    });
    const result = properties.map(p => ({
      ...p,
      daysUntilAuction: Math.floor((new Date(p.auctionDate) - now) / 86400000)
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/send-auction-alerts', async (req, res, next) => {
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const properties = await prisma.property.findMany({
      where: { auctionDate: { gte: now, lte: cutoff } },
      orderBy: { auctionDate: 'asc' }
    });

    const results = [];
    for (const p of properties) {
      const daysUntilAuction = Math.floor((new Date(p.auctionDate) - now) / 86400000);
      try {
        await sendAuctionAlert(p, daysUntilAuction);
        results.push({ id: p.id, address: p.address, status: 'sent' });
      } catch (err) {
        results.push({ id: p.id, address: p.address, status: 'failed', error: err.message });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
});

export default router;
