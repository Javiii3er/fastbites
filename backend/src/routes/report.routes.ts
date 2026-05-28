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

// Top 5 productos más vendidos
router.get('/top-products',
  authenticate, authorize('ADMIN', 'MANAGER'), async (_req, res, next) => {
    try {
      const data = await prisma.$queryRaw`
        SELECT
          p.name as product,
          c.name as category,
          SUM(oi.quantity) as totalSold,
          SUM(oi.totalPrice) as totalRevenue
        FROM order_items oi
        JOIN products p ON oi.productId = p.id
        JOIN categories c ON p.categoryId = c.id
        JOIN orders o ON oi.orderId = o.id
        WHERE o.status != 'CANCELLED'
        GROUP BY p.id, p.name, c.name
        ORDER BY totalSold DESC
        LIMIT 5
      `;
      const serialized = (data as any[]).map((row) => ({
        product:      row.product,
        category:     row.category,
        totalSold:    Number(row.totalSold),
        totalRevenue: Number(row.totalRevenue),
      }));
      sendSuccess(res, serialized);
    } catch (err) { next(err); }
  });

// Resumen general
router.get('/summary',
  authenticate, authorize('ADMIN', 'MANAGER'), async (_req, res, next) => {
    try {
      const [totalRevenue, avgOrder, topClient, topProduct] = await Promise.all([
        // Total ingresos del mes
        prisma.$queryRaw`
          SELECT SUM(total) as totalRevenue, COUNT(*) as totalOrders
          FROM orders
          WHERE status != 'CANCELLED'
          AND MONTH(createdAt) = MONTH(NOW())
          AND YEAR(createdAt) = YEAR(NOW())
        `,
        // Pedido promedio
        prisma.$queryRaw`
          SELECT AVG(total) as avgOrder
          FROM orders
          WHERE status != 'CANCELLED'
        `,
        // Cliente más frecuente
        prisma.$queryRaw`
          SELECT u.name as clientName, COUNT(*) as orderCount
          FROM orders o
          JOIN users u ON o.userId = u.id
          WHERE o.status != 'CANCELLED'
          GROUP BY o.userId, u.name
          ORDER BY orderCount DESC
          LIMIT 1
        `,
        // Producto más vendido
        prisma.$queryRaw`
          SELECT p.name as productName, SUM(oi.quantity) as totalSold
          FROM order_items oi
          JOIN products p ON oi.productId = p.id
          JOIN orders o ON oi.orderId = o.id
          WHERE o.status != 'CANCELLED'
          GROUP BY p.id, p.name
          ORDER BY totalSold DESC
          LIMIT 1
        `,
      ]);

      const revenue = (totalRevenue as any[])[0] ?? {};
      const avg     = (avgOrder as any[])[0] ?? {};
      const client  = (topClient as any[])[0] ?? {};
      const product = (topProduct as any[])[0] ?? {};

      sendSuccess(res, {
        totalRevenue:  Number(revenue.totalRevenue ?? 0),
        totalOrders:   Number(revenue.totalOrders  ?? 0),
        avgOrder:      Number(avg.avgOrder          ?? 0),
        topClient:     client.clientName            ?? '—',
        topClientOrders: Number(client.orderCount   ?? 0),
        topProduct:    product.productName          ?? '—',
        topProductSold: Number(product.totalSold    ?? 0),
      });
    } catch (err) { next(err); }
  });

export default router;