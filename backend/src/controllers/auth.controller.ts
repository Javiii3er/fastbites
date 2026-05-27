import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { Resend } from 'resend';
import { prisma } from '../db/prisma';
import { signToken } from '../auth/jwt.utils';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ─── Schemas ──────────────────────────────────────────────────────────────────

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

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Siempre respondemos lo mismo para no revelar si el email existe
    if (!user) {
      sendSuccess(res, null, 'Si el email existe, recibirás instrucciones en breve');
      return;
    }

    // Invalidar tokens anteriores del mismo usuario
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // Generar token único
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

    // Enviar email con Resend
    await resend.emails.send({
      from:    'FastBites <onboarding@resend.dev>',
      to:      user.email,
      subject: '🔥 Recupera tu contraseña — FastBites',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
                    background: #1a1a2e; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #e11d48; font-size: 28px; margin-bottom: 8px;">🔥 FASTBITES</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px;">
            Sistema de E-Commerce de Comida Rápida
          </p>
          <h2 style="font-size: 20px; margin-bottom: 16px;">Recupera tu contraseña</h2>
          <p style="color: #cbd5e1; margin-bottom: 24px;">
            Hola <strong>${user.name}</strong>, recibimos una solicitud para restablecer
            la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una
            nueva contraseña.
          </p>
          <a href="${resetLink}"
             style="display: inline-block; background: #e11d48; color: #ffffff;
                    padding: 14px 32px; border-radius: 8px; text-decoration: none;
                    font-weight: bold; font-size: 16px; margin-bottom: 24px;">
            Restablecer contraseña
          </a>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            Este enlace expirará en <strong>1 hora</strong>. Si no solicitaste
            restablecer tu contraseña, puedes ignorar este mensaje.
          </p>
          <hr style="border-color: #334155; margin: 24px 0;" />
          <p style="color: #475569; font-size: 12px;">
            FastBites — Universidad Mariano Gálvez de Guatemala
          </p>
        </div>
      `,
    });

    sendSuccess(res, null, 'Si el email existe, recibirás instrucciones en breve');
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = z.object({
      token:    z.string().min(1),
      password: z.string()
        .min(8,    'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    }).parse(req.body);

    // Verificar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new AppError('El enlace de recuperación es inválido o ya expiró', 400);
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(password, env.bcrypt.rounds);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data:  { password: hashedPassword },
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { used: true },
    });

    sendSuccess(res, null, 'Contraseña actualizada correctamente');
  } catch (err) {
    next(err);
  }
};