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
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: { isDefault: 'desc' },
    });
    sendSuccess(res, addresses);
  } catch (err) { next(err); }
});

userRouter.post('/addresses', authenticate, async (req, res, next) => {
  try {
    const address = await prisma.address.create({
      data: { ...req.body, userId: req.user!.userId }
    });
    sendSuccess(res, address, 'Dirección guardada', 201);
  } catch (err) { next(err); }
});

// Eliminar dirección
userRouter.delete('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.address.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user!.userId }
    });
    sendSuccess(res, null, 'Dirección eliminada');
  } catch (err) { next(err); }
});

// Marcar dirección como principal
userRouter.patch('/addresses/:id/default', authenticate, async (req, res, next) => {
  try {
    await prisma.address.updateMany({
      where: { userId: req.user!.userId },
      data: { isDefault: false }
    });
    const address = await prisma.address.update({
      where: { id: parseInt(req.params.id) },
      data: { isDefault: true }
    });
    sendSuccess(res, address, 'Dirección principal actualizada');
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

// Reset contraseña (solo admin)
userRouter.patch('/:id/reset-password', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      res.status(400).json({ success: false, message: 'Contraseña debe tener al menos 8 caracteres' });
      return;
    }
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { password: hashed },
      select: { id: true, name: true, email: true },
    });
    sendSuccess(res, user, 'Contraseña actualizada correctamente');
  } catch (err) { next(err); }
});

// Admin — crear usuario con rol específico
userRouter.post('/create', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Nombre, email y contraseña son requeridos' });
      return;
    }
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
      return;
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone: phone || null, role: role || 'CLIENT' },
      select: { id: true, name: true, email: true, role: true },
    });
    sendSuccess(res, user, 'Usuario creado correctamente', 201);
  } catch (err) { next(err); }
});

export { userRouter as default };