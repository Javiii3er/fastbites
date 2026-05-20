import { Router } from 'express';
import {
  createOrder, getMyOrders, getAllOrders, updateOrderStatus,
  salesByDay, salesByDayPart,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Cliente autenticado
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);

// Admin / Manager
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), getAllOrders);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), updateOrderStatus);

export default router;
