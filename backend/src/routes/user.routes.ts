// ─── user.routes.ts ──────────────────────────────────────────────────────────
import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate, authorize } from '../auth/auth.middleware';

const userRouter = Router();

// Perfil propio
userRouter.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, addresses: true },
    });
    sendSuccess(res, user);
  } catch (err) { next(err); }
});

userRouter.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true },
    });
    sendSuccess(res, user, 'Perfil actualizado');
  } catch (err) { next(err); }
});

// Direcciones
userRouter.get('/addresses', authenticate, async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.userId } });
    sendSuccess(res, addresses);
  } catch (err) { next(err); }
});

userRouter.post('/addresses', authenticate, async (req, res, next) => {
  try {
    const address = await prisma.address.create({ data: { ...req.body, userId: req.user!.userId } });
    sendSuccess(res, address, 'Dirección guardada', 201);
  } catch (err) { next(err); }
});

// Admin — listar todos los usuarios
userRouter.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, users);
  } catch (err) { next(err); }
});

userRouter.patch('/:id/toggle', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!u) { res.status(404).json({ success: false, message: 'No encontrado' }); return; }
    const updated = await prisma.user.update({ where: { id: u.id }, data: { isActive: !u.isActive } });
    sendSuccess(res, { id: updated.id, isActive: updated.isActive });
  } catch (err) { next(err); }
});

export { userRouter as default };
