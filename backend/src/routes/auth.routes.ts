import { Router } from 'express';
import { register, login, me, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.post('/reset-password', resetPassword);

export default router;
