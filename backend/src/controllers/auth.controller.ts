import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { signToken } from '../auth/jwt.utils';
import { sendSuccess, sendError } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';

// ─── Schemas de validación ────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  phone: z.string().min(8).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// ─── Controladores ────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone } = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('Ya existe una cuenta con este email', 409);

    const hashedPassword = await bcrypt.hash(password, env.bcrypt.rounds);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    sendSuccess(res, { user, token }, 'Cuenta creada exitosamente', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError('Credenciales inválidas', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Credenciales inválidas', 401);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    sendSuccess(res, {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    }, 'Sesión iniciada correctamente');
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    // En producción: enviar email con token de recuperación
    // Por ahora retornamos éxito genérico para no revelar si el email existe
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(`[forgotPassword] Solicitud para: ${email} — encontrado: ${!!user}`);
    sendSuccess(res, null, 'Si el email existe, recibirás instrucciones en breve');
  } catch (err) {
    next(err);
  }
};
