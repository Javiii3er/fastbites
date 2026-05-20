import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Públicas — solo ofertas activas y vigentes
router.get('/', async (_req, res, next) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true, endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
    });
    sendSuccess(res, offers);
  } catch (err) { next(err); }
});

// Admin
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const offer = await prisma.offer.create({ data: req.body });
    sendSuccess(res, offer, 'Oferta creada', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const offer = await prisma.offer.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    sendSuccess(res, offer);
  } catch (err) { next(err); }
});

router.patch('/:id/toggle', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const o = await prisma.offer.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!o) { res.status(404).json({ success: false, message: 'No encontrada' }); return; }
    const updated = await prisma.offer.update({ where: { id: o.id }, data: { isActive: !o.isActive } });
    sendSuccess(res, updated);
  } catch (err) { next(err); }
});

export default router;
