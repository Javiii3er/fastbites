import app from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos MySQL');

    app.listen(env.port, () => {
      console.log(`\n🚀 FastBites API corriendo en http://localhost:${env.port}`);
      console.log(`   Entorno: ${env.nodeEnv}`);
      console.log(`   Health:  http://localhost:${env.port}/health\n`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido — cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
