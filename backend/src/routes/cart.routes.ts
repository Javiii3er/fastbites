// ─── cart.routes.ts ──────────────────────────────────────────────────────────
import { Router } from 'express';
import { prisma } from '../db/prisma';
import { sendSuccess } from '../utils/response';
import { authenticate } from '../auth/auth.middleware';

const cartRouter = Router();

// ─── Obtener carrito del usuario autenticado ──────────────────────────────────
cartRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            sizes: { where: { isActive: true } },
            addons: { where: { isActive: true } },
            drinks: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    sendSuccess(res, items);
  } catch (err) { next(err); }
});

// ─── Agregar ítem al carrito ──────────────────────────────────────────────────
cartRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { productId, sizeId, drinkId, quantity, unitPrice, notes, addonIds } = req.body;

    const item = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        sizeId:    sizeId    ?? null,
        drinkId:   drinkId   ?? null,
        quantity:  quantity  ?? 1,
        unitPrice,
        notes:     notes     ?? null,
        addonIds:  addonIds?.length ? JSON.stringify(addonIds) : null,
      },
      include: {
        product: { include: { category: true } },
      },
    });
    sendSuccess(res, item, 'Producto agregado al carrito', 201);
  } catch (err) { next(err); }
});

// ─── Actualizar cantidad de un ítem ──────────────────────────────────────────
cartRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const id     = parseInt(req.params.id);
    const { quantity } = req.body;

    // Verificar que el ítem pertenece al usuario
    const existing = await prisma.cartItem.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Ítem no encontrado' });
      return;
    }

    const item = await prisma.cartItem.update({
      where: { id },
      data:  { quantity },
      include: { product: { include: { category: true } } },
    });
    sendSuccess(res, item);
  } catch (err) { next(err); }
});

// ─── Eliminar un ítem del carrito ─────────────────────────────────────────────
cartRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const id     = parseInt(req.params.id);

    await prisma.cartItem.deleteMany({ where: { id, userId } });
    sendSuccess(res, null, 'Ítem eliminado del carrito');
  } catch (err) { next(err); }
});

// ─── Vaciar carrito completo ──────────────────────────────────────────────────
cartRouter.delete('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await prisma.cartItem.deleteMany({ where: { userId } });
    sendSuccess(res, null, 'Carrito vaciado');
  } catch (err) { next(err); }
});

export { cartRouter as default };