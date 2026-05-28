import { Router } from 'express';
import { salesByDay, salesByDayPart } from '../controllers/order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/sales/by-day',
  authenticate, authorize('ADMIN', 'MANAGER'), salesByDay);

router.get('/sales/by-daypart',
  authenticate, authorize('ADMIN', 'MANAGER'), salesByDayPart);

router.get('/sales/by-hour',
  authenticate, authorize('ADMIN', 'MANAGER'), async (_req, res, next) => {
    try {
      const data = await prisma.$queryRaw`
        SELECT HOUR(createdAt) as hour, COUNT(*) as orders, SUM(total) as revenue
        FROM orders WHERE status != 'CANCELLED'
        GROUP BY HOUR(createdAt) ORDER BY hour
      `;
      const serialized = (data as any[]).map((row) => ({
        hour:    Number(row.hour),
        orders:  Number(row.orders),
        revenue: Number(row.revenue),
      }));
      sendSuccess(res, serialized);
    } catch (err) { next(err); }
  });

export default router;