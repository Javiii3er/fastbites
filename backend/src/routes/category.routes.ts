// category.routes.ts
import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ where: { isActive: true } });
    sendSuccess(res, categories);
  } catch (err) { next(err); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const cat = await prisma.category.create({ data: req.body });
    sendSuccess(res, cat, 'Categoría creada', 201);
  } catch (err) { next(err); }
});

export default router;
