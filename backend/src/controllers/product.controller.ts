import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { sendSuccess, sendError, paginate } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  restaurantId: z.number().int().positive(),
  categoryId:   z.number().int().positive(),
  name:         z.string().min(2).max(100),
  description:  z.string().optional(),
  basePrice:    z.number().positive(),
  imageUrl:     z.string().url().optional(),
});

// ─── Controladores ────────────────────────────────────────────────────────────

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page       = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit      = Math.min(50, parseInt(req.query.limit as string) || 12);
    const skip       = (page - 1) * limit;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const search     = req.query.search  as string | undefined;
    const dayPart    = req.query.dayPart as string | undefined;
    const showAll    = req.query.showAll === 'true';

    const where = {
      ...(!showAll && { isActive: true }),
      ...(categoryId && { categoryId }),
      ...(search     && { name: { contains: search } }),
      ...(dayPart    && { category: { dayPart: dayPart as any } }),
    };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, dayPart: true } },
          sizes:    { where: { isActive: true } },
          addons:   { where: { isActive: true } },
          drinks:   { where: { isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    sendSuccess(res, products, 'OK', 200, paginate(page, limit, total));
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError('ID inválido', 400);

    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      include: {
        category:   true,
        restaurant: { select: { id: true, name: true } },
        sizes:      { where: { isActive: true } },
        addons:     { where: { isActive: true } },
        drinks:     { where: { isActive: true } },
      },
    });

    if (!product) throw new AppError('Producto no encontrado', 404);
    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data    = createProductSchema.parse(req.body);
    const product = await prisma.product.create({ data });
    sendSuccess(res, product, 'Producto creado', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id      = parseInt(req.params.id);
    const data    = createProductSchema.partial().parse(req.body);
    const product = await prisma.product.update({ where: { id }, data });
    sendSuccess(res, product, 'Producto actualizado');
  } catch (err) {
    next(err);
  }
};

export const toggleProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id      = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Producto no encontrado', 404);
    const updated = await prisma.product.update({
      where: { id },
      data:  { isActive: !product.isActive },
    });
    sendSuccess(res, updated, `Producto ${updated.isActive ? 'activado' : 'desactivado'}`);
  } catch (err) {
    next(err);
  }
};