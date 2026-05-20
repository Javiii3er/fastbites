// ─── restaurant.routes.ts ────────────────────────────────────────────────────
import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate, authorize } from '../auth/auth.middleware';

const restaurantRouter = Router();

restaurantRouter.get('/', async (_req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: { dayParts: true },
    });
    sendSuccess(res, restaurants);
  } catch (err) { next(err); }
});

restaurantRouter.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const r = await prisma.restaurant.create({ data: req.body });
    sendSuccess(res, r, 'Restaurante creado', 201);
  } catch (err) { next(err); }
});

restaurantRouter.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const r = await prisma.restaurant.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    sendSuccess(res, r);
  } catch (err) { next(err); }
});

export { restaurantRouter as default };
