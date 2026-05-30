import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const buyers = await prisma.buyer.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(buyers);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, zipCodes, minPrice, maxPrice, conditions, strategies, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const buyer = await prisma.buyer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        zipCodes: zipCodes || [],
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        conditions: conditions || [],
        strategies: strategies || [],
        notes: notes || null
      }
    });
    res.status(201).json(buyer);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const buyer = await prisma.buyer.findUnique({ where: { id: req.params.id } });
    if (!buyer) return res.status(404).json({ error: 'Not found' });
    res.json(buyer);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'phone', 'zipCodes', 'minPrice', 'maxPrice', 'conditions', 'strategies', 'notes', 'dealsCount', 'lastDealDate'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    const buyer = await prisma.buyer.update({ where: { id: req.params.id }, data });
    res.json(buyer);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.buyer.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
