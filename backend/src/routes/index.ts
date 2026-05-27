import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import restaurantRoutes from './restaurant.routes';
import orderRoutes from './order.routes';
import offerRoutes from './offer.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import cartRoutes from './cart.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/orders', orderRoutes);
router.use('/offers', offerRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/cart', cartRoutes); 
export default router;