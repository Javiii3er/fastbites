import { PrismaClient, Role, DayPart } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de FastBites...');

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const clientPassword = await bcrypt.hash('Client123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fastbites.com' },
    update: {},
    create: {
      name: 'Admin FastBites',
      email: 'admin@fastbites.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@fastbites.com' },
    update: {},
    create: {
      name: 'Manager Zona 1',
      email: 'manager@fastbites.com',
      password: adminPassword,
      role: Role.MANAGER,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'cliente@fastbites.com' },
    update: {},
    create: {
      name: 'Juan Pérez',
      email: 'cliente@fastbites.com',
      password: clientPassword,
      phone: '50212345678',
      role: Role.CLIENT,
    },
  });

  console.log('✅ Usuarios creados:', { admin: admin.email, manager: manager.email, client: client.email });

  // ─── Restaurante ──────────────────────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'FastBites Zona 1',
      address: '6a Avenida, Zona 1, Ciudad de Guatemala',
      latitude: 14.6407,
      longitude: -90.5133,
      phone: '25001234',
    },
  });

  // Day parts del restaurante
  await prisma.restaurantDayPart.createMany({
    skipDuplicates: true,
    data: [
      { restaurantId: restaurant.id, dayPart: DayPart.BREAKFAST, startTime: '06:00', endTime: '11:00' },
      { restaurantId: restaurant.id, dayPart: DayPart.LUNCH,     startTime: '11:00', endTime: '16:00' },
      { restaurantId: restaurant.id, dayPart: DayPart.DINNER,    startTime: '16:00', endTime: '22:00' },
    ],
  });

  console.log('✅ Restaurante creado:', restaurant.name);

  // ─── Categorías ────────────────────────────────────────────────────────────
  const catDesayuno = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Desayunos', dayPart: DayPart.BREAKFAST, imageUrl: '/images/categories/breakfast.jpg' },
  });
  const catHamburguesas = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Hamburguesas', dayPart: DayPart.LUNCH, imageUrl: '/images/categories/burgers.jpg' },
  });
  const catPizzas = await prisma.category.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'Pizzas', dayPart: DayPart.DINNER, imageUrl: '/images/categories/pizzas.jpg' },
  });

  console.log('✅ Categorías creadas');

  // ─── Productos ─────────────────────────────────────────────────────────────
  const burger = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      restaurantId: restaurant.id,
      categoryId: catHamburguesas.id,
      name: 'FastBurger Classic',
      description: 'Hamburguesa clásica con carne 100% res, lechuga, tomate y cebolla',
      basePrice: 45.00,
      imageUrl: '/images/products/classic-burger.jpg',
    },
  });

  // Tamaños
  await prisma.productSize.createMany({
    skipDuplicates: true,
    data: [
      { productId: burger.id, name: 'Individual', extraPrice: 0 },
      { productId: burger.id, name: 'Combo',      extraPrice: 20.00 },
      { productId: burger.id, name: 'Familiar',   extraPrice: 45.00 },
    ],
  });

  // Addons
  await prisma.addon.createMany({
    skipDuplicates: true,
    data: [
      { productId: burger.id, name: 'Extra queso',     price: 5.00 },
      { productId: burger.id, name: 'Doble carne',     price: 15.00 },
      { productId: burger.id, name: 'Jalapeños',       price: 3.00 },
      { productId: burger.id, name: 'Tocino extra',    price: 8.00 },
    ],
  });

  // Bebidas
  await prisma.drink.createMany({
    skipDuplicates: true,
    data: [
      { productId: burger.id, name: 'Agua pura',   price: 0 },
      { productId: burger.id, name: 'Coca-Cola',   price: 10.00 },
      { productId: burger.id, name: 'Jugo natural',price: 12.00 },
    ],
  });

  const pizza = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: 'Pizza Pepperoni',
      description: 'Pizza con salsa de tomate, mozzarella y pepperoni',
      basePrice: 75.00,
      imageUrl: '/images/products/pepperoni-pizza.jpg',
    },
  });

  await prisma.productSize.createMany({
    skipDuplicates: true,
    data: [
      { productId: pizza.id, name: 'Personal (6")', extraPrice: 0 },
      { productId: pizza.id, name: 'Mediana (10")', extraPrice: 30.00 },
      { productId: pizza.id, name: 'Familiar (14")',extraPrice: 60.00 },
    ],
  });

  console.log('✅ Productos creados');

  // ─── Ofertas ───────────────────────────────────────────────────────────────
  await prisma.offer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: '2x1 en Hamburguesas',
      description: 'Todos los martes lleva dos hamburguesas al precio de una',
      discount: 50,
      code: 'MARTES2X1',
      imageUrl: '/images/offers/2x1-burger.jpg',
      startsAt: new Date('2026-01-01'),
      endsAt: new Date('2026-12-31'),
    },
  });

  await prisma.offer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Pizza + Bebida',
      description: '20% de descuento en tu pizza al agregar una bebida',
      discount: 20,
      code: 'PIZZABEBIDA',
      imageUrl: '/images/offers/pizza-drink.jpg',
      startsAt: new Date('2026-01-01'),
      endsAt: new Date('2026-12-31'),
    },
  });

  console.log('✅ Ofertas creadas');
  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('   Admin:   admin@fastbites.com   / Admin123!');
  console.log('   Manager: manager@fastbites.com / Admin123!');
  console.log('   Cliente: cliente@fastbites.com / Client123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
