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

userRouter.delete('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.address.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user!.userId }
    });
    sendSuccess(res, null, 'Dirección eliminada');
  } catch (err) { next(err); }
});

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

// ─── Métodos de pago ──────────────────────────────────────────────────────────
userRouter.get('/payment-methods', authenticate, async (req, res, next) => {
  try {
    const methods = await prisma.paymentMethod_.findMany({
      where: { userId: req.user!.userId },
      orderBy: { isDefault: 'desc' },
    });
    sendSuccess(res, methods);
  } catch (err) { next(err); }
});

userRouter.post('/payment-methods', authenticate, async (req, res, next) => {
  try {
    const { alias, lastFour, brand } = req.body;
    if (!alias || !lastFour || !brand) {
      res.status(400).json({ success: false, message: 'Alias, últimos 4 dígitos y marca son requeridos' });
      return;
    }
    if (lastFour.length !== 4 || !/^\d+$/.test(lastFour)) {
      res.status(400).json({ success: false, message: 'Los últimos 4 dígitos deben ser exactamente 4 números' });
      return;
    }
    const count = await prisma.paymentMethod_.count({ where: { userId: req.user!.userId } });
    const method = await prisma.paymentMethod_.create({
      data: { alias, lastFour, brand, userId: req.user!.userId, isDefault: count === 0 }
    });
    sendSuccess(res, method, 'Método de pago agregado', 201);
  } catch (err) { next(err); }
});

userRouter.delete('/payment-methods/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.paymentMethod_.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user!.userId }
    });
    sendSuccess(res, null, 'Método de pago eliminado');
  } catch (err) { next(err); }
});

userRouter.patch('/payment-methods/:id/default', authenticate, async (req, res, next) => {
  try {
    await prisma.paymentMethod_.updateMany({
      where: { userId: req.user!.userId },
      data: { isDefault: false }
    });
    const method = await prisma.paymentMethod_.update({
      where: { id: parseInt(req.params.id) },
      data: { isDefault: true }
    });
    sendSuccess(res, method, 'Método de pago principal actualizado');
  } catch (err) { next(err); }
});

// ─── Admin ────────────────────────────────────────────────────────────────────
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