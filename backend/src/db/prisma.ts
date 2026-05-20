import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Singleton para evitar múltiples conexiones en desarrollo (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev) globalForPrisma.prisma = prisma;
