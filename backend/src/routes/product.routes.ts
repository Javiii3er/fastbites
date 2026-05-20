import { Router } from 'express';
import {
  getProducts, getProductById, createProduct, updateProduct, toggleProduct,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../auth/auth.middleware';

const router = Router();

// Públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Solo Admin / Manager
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), updateProduct);
router.patch('/:id/toggle', authenticate, authorize('ADMIN', 'MANAGER'), toggleProduct);

export default router;
