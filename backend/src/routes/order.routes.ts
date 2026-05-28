import { Router } from 'express';
import {
  createOrder, getMyOrders, getAllOrders, updateOrderStatus,
  salesByDay, salesByDayPart,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';

const router = Router();

// Cliente autenticado
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);

// Cliente — cancelar su propio pedido (solo si está PENDING)
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const id     = parseInt(req.params.id);

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      return;
    }
    if (order.userId !== userId) {
      res.status(403).json({ success: false, message: 'No tienes permiso para cancelar este pedido' });
      return;
    }
    if (order.status !== 'PENDING') {
      res.status(400).json({ success: false, message: 'Solo puedes cancelar pedidos en estado Pendiente' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data:  { status: 'CANCELLED' },
    });
    sendSuccess(res, updated, 'Pedido cancelado correctamente');
  } catch (err) { next(err); }
});

// Admin / Manager
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getAllOrders);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), updateOrderStatus);

export default router;
