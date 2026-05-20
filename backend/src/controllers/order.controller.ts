import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { sendSuccess, paginate } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  sizeId: z.number().int().positive().optional(),
  drinkId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().max(255).optional(),
  addonIds: z.array(z.number().int().positive()).optional(),
});

export const createOrderSchema = z.object({
  restaurantId: z.number().int().positive(),
  addressId: z.number().int().positive().optional(),
  offerId: z.number().int().positive().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'El pedido debe tener al menos un producto'),
});

// ─── Controladores ────────────────────────────────────────────────────────────

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { restaurantId, addressId, offerId, paymentMethod, notes, items } = createOrderSchema.parse(req.body);

    // Calcular precios
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({ where: { id: item.productId, isActive: true } });
      if (!product) throw new AppError(`Producto ${item.productId} no encontrado`, 404);

      let unitPrice = Number(product.basePrice);

      if (item.sizeId) {
        const size = await prisma.productSize.findUnique({ where: { id: item.sizeId } });
        if (size) unitPrice += Number(size.extraPrice);
      }

      if (item.drinkId) {
        const drink = await prisma.drink.findUnique({ where: { id: item.drinkId } });
        if (drink) unitPrice += Number(drink.price);
      }

      let addonTotal = 0;
      const addonsData: { addonId: number; price: number }[] = [];
      if (item.addonIds?.length) {
        const addons = await prisma.addon.findMany({ where: { id: { in: item.addonIds } } });
        addons.forEach((a) => {
          addonTotal += Number(a.price);
          addonsData.push({ addonId: a.id, price: Number(a.price) });
        });
      }

      const itemTotal = (unitPrice + addonTotal) * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        sizeId: item.sizeId,
        drinkId: item.drinkId,
        quantity: item.quantity,
        unitPrice: unitPrice + addonTotal,
        totalPrice: itemTotal,
        notes: item.notes,
        addons: { create: addonsData },
      });
    }

    // Aplicar descuento si hay oferta
    let discount = 0;
    if (offerId) {
      const offer = await prisma.offer.findFirst({
        where: { id: offerId, isActive: true, endsAt: { gte: new Date() } },
      });
      if (offer) discount = subtotal * (Number(offer.discount) / 100);
    }

    const total = subtotal - discount;

    const order = await prisma.order.create({
      data: {
        userId, restaurantId, addressId, offerId, paymentMethod, notes,
        subtotal, discount, total,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true, addons: true } } },
    });

    sendSuccess(res, order, 'Pedido creado exitosamente', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: { userId },
        skip, take: limit,
        include: {
          restaurant: { select: { name: true } },
          items: { include: { product: { select: { name: true, imageUrl: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    sendSuccess(res, orders, 'OK', 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as OrderStatus | undefined;

    const where = status ? { status } : {};
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip, take: limit,
        include: {
          user: { select: { name: true, email: true } },
          restaurant: { select: { name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    sendSuccess(res, orders, 'OK', 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { status } = z.object({ status: z.nativeEnum(OrderStatus) }).parse(req.body);
    const order = await prisma.order.update({ where: { id }, data: { status } });
    sendSuccess(res, order, 'Estado actualizado');
  } catch (err) {
    next(err);
  }
};

// ─── Reportería ───────────────────────────────────────────────────────────────

export const salesByDay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sales = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as orders, SUM(total) as revenue
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `;
    sendSuccess(res, sales);
  } catch (err) {
    next(err);
  }
};

export const salesByDayPart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sales = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN HOUR(createdAt) BETWEEN 6 AND 10 THEN 'BREAKFAST'
          WHEN HOUR(createdAt) BETWEEN 11 AND 15 THEN 'LUNCH'
          ELSE 'DINNER'
        END as dayPart,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY dayPart
    `;
    sendSuccess(res, sales);
  } catch (err) {
    next(err);
  }
};
