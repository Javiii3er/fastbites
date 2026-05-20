import { Router } from 'express';
import { salesByDay, salesByDayPart } from '../controllers/order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

router.get('/sales/by-day', authenticate, authorize('ADMIN', 'MANAGER'), salesByDay);
router.get('/sales/by-daypart', authenticate, authorize('ADMIN', 'MANAGER'), salesByDayPart);

// Ventas por hora
router.get('/sales/by-hour', authenticate, authorize('ADMIN', 'MANAGER'), async (_req, res, next) => {
  try {
    const { prisma } = await import('../db/prisma');
    const data = await prisma.$queryRaw`
      SELECT HOUR(createdAt) as hour, COUNT(*) as orders, SUM(total) as revenue
      FROM orders WHERE status != 'CANCELLED'
      GROUP BY HOUR(createdAt) ORDER BY hour
    `;
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
