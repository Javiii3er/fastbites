import { PrismaClient, Role, DayPart } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de FastBites...');

  // ─── Usuarios ──────────────────────────────────────────
  const adminPwd  = await bcrypt.hash('Admin123!',  10);
  const clientPwd = await bcrypt.hash('Client123!', 10);

  await prisma.user.upsert({ where: { email: 'admin@fastbites.com' }, update: {},
    create: { name: 'Admin FastBites', email: 'admin@fastbites.com', password: adminPwd, role: Role.ADMIN } });
  await prisma.user.upsert({ where: { email: 'manager@fastbites.com' }, update: {},
    create: { name: 'Manager Zona 1', email: 'manager@fastbites.com', password: adminPwd, role: Role.MANAGER } });
  await prisma.user.upsert({ where: { email: 'cliente@fastbites.com' }, update: {},
    create: { name: 'Juan Pérez', email: 'cliente@fastbites.com', password: clientPwd, phone: '50212345678', role: Role.CLIENT } });
  await prisma.user.upsert({ where: { email: 'maria@email.com' }, update: {},
    create: { name: 'María García', email: 'maria@email.com', password: clientPwd, phone: '50287654321', role: Role.CLIENT } });
  console.log('✅ Usuarios creados');

  // ─── Restaurantes ──────────────────────────────────────
  const r1 = await prisma.restaurant.upsert({ where: { id: 1 }, update: {},
    create: { name: 'FastBites Zona 1', address: '6a Avenida 3-12, Zona 1, Ciudad de Guatemala', latitude: 14.6407, longitude: -90.5133, phone: '25001234' } });
  const r2 = await prisma.restaurant.upsert({ where: { id: 2 }, update: {},
    create: { name: 'FastBites Zona 10', address: 'Boulevard Los Próceres, Zona 10, Guatemala', latitude: 14.6010, longitude: -90.5070, phone: '25005678' } });
  const r3 = await prisma.restaurant.upsert({ where: { id: 3 }, update: {},
    create: { name: 'FastBites Miraflores', address: 'Centro Comercial Miraflores, Zona 11', latitude: 14.6200, longitude: -90.5400, phone: '25009012' } });

  for (const r of [r1, r2, r3]) {
    await prisma.restaurantDayPart.createMany({ skipDuplicates: true, data: [
      { restaurantId: r.id, dayPart: DayPart.BREAKFAST, startTime: '06:00', endTime: '11:00' },
      { restaurantId: r.id, dayPart: DayPart.LUNCH,     startTime: '11:00', endTime: '16:00' },
      { restaurantId: r.id, dayPart: DayPart.DINNER,    startTime: '16:00', endTime: '22:00' },
    ]});
  }
  console.log('✅ Restaurantes creados');

  // ─── Categorías ────────────────────────────────────────
  const [catDesayuno, catBurger, catPizza, catPollo, catTacos,
         catPapas, catEnsaladas, catHotdog, catPostres, catBebidas] = await Promise.all([
    prisma.category.upsert({ where: { id: 1  }, update: {}, create: { name: 'Desayunos',     dayPart: DayPart.BREAKFAST } }),
    prisma.category.upsert({ where: { id: 2  }, update: {}, create: { name: 'Hamburguesas',  dayPart: DayPart.LUNCH     } }),
    prisma.category.upsert({ where: { id: 3  }, update: {}, create: { name: 'Pizzas',        dayPart: DayPart.DINNER    } }),
    prisma.category.upsert({ where: { id: 4  }, update: {}, create: { name: 'Pollo',         dayPart: DayPart.LUNCH     } }),
    prisma.category.upsert({ where: { id: 5  }, update: {}, create: { name: 'Tacos y Wraps', dayPart: DayPart.LUNCH     } }),
    prisma.category.upsert({ where: { id: 6  }, update: {}, create: { name: 'Papas y Snacks',dayPart: DayPart.LUNCH     } }),
    prisma.category.upsert({ where: { id: 7  }, update: {}, create: { name: 'Ensaladas',     dayPart: DayPart.LUNCH     } }),
    prisma.category.upsert({ where: { id: 8  }, update: {}, create: { name: 'Hot Dogs',      dayPart: DayPart.DINNER    } }),
    prisma.category.upsert({ where: { id: 9  }, update: {}, create: { name: 'Postres',       dayPart: DayPart.DINNER    } }),
    prisma.category.upsert({ where: { id: 10 }, update: {}, create: { name: 'Bebidas',       dayPart: DayPart.LUNCH     } }),
  ]);
  console.log('✅ Categorías creadas (10)');

  // ─── Helper ────────────────────────────────────────────
  const stdDrinks = [
    { name: 'Sin bebida',    price: 0  },
    { name: 'Agua pura',     price: 0  },
    { name: 'Coca-Cola',     price: 10 },
    { name: 'Coca-Cola Zero',price: 10 },
    { name: 'Jugo natural',  price: 14 },
    { name: 'Limonada',      price: 12 },
  ];
  const stdSizes = [
    { name: 'Individual', extra: 0  },
    { name: 'Combo',      extra: 20 },
    { name: 'Familiar',   extra: 45 },
  ];
  const pizzaSizes = [
    { name: 'Personal 6"',  extra: 0  },
    { name: 'Mediana 10"',  extra: 30 },
    { name: 'Familiar 14"', extra: 60 },
  ];

  const cp = async (
    id: number, restaurantId: number, categoryId: number,
    name: string, description: string, basePrice: number,
    imageUrl: string,
    sizes: { name: string; extra: number }[],
    addons: { name: string; price: number }[],
    drinks: { name: string; price: number }[]
  ) => {
    const p = await prisma.product.upsert({ where: { id }, update: { imageUrl },
      create: { id, restaurantId, categoryId, name, description, basePrice, imageUrl } });
    await prisma.productSize.createMany({ skipDuplicates: true,
      data: sizes.map(s => ({ productId: p.id, name: s.name, extraPrice: s.extra })) });
    await prisma.addon.createMany({ skipDuplicates: true,
      data: addons.map(a => ({ productId: p.id, name: a.name, price: a.price })) });
    await prisma.drink.createMany({ skipDuplicates: true,
      data: drinks.map(d => ({ productId: p.id, name: d.name, price: d.price })) });
    return p;
  };

  // ─── DESAYUNOS ─────────────────────────────────────────
  await cp(1, r1.id, catDesayuno.id, 'Desayuno Completo',
    'Huevos a tu gusto, frijoles volteados, plátanos fritos y pan tostado', 55,
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80',
    [{ name: 'Sin bebida', extra: 0 }, { name: 'Con café', extra: 12 }, { name: 'Con jugo', extra: 15 }],
    [{ name: 'Huevo extra', price: 8 }, { name: 'Frijoles extra', price: 6 }, { name: 'Crema', price: 5 }],
    [{ name: 'Café americano', price: 0 }, { name: 'Café con leche', price: 5 }, { name: 'Jugo de naranja', price: 12 }]);

  await cp(2, r2.id, catDesayuno.id, 'Pancakes Stack',
    'Torre de pancakes esponjosos con miel de maple, mantequilla y frutos rojos', 48,
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
    [{ name: '3 pancakes', extra: 0 }, { name: '5 pancakes', extra: 15 }, { name: '7 pancakes', extra: 25 }],
    [{ name: 'Nutella', price: 8 }, { name: 'Fresas extra', price: 7 }, { name: 'Crema batida', price: 5 }],
    [{ name: 'Café americano', price: 0 }, { name: 'Leche', price: 8 }, { name: 'Jugo de naranja', price: 12 }]);

  await cp(3, r3.id, catDesayuno.id, 'Bagel con Salmón',
    'Bagel tostado con queso crema, salmón ahumado, alcaparras y eneldo', 65,
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Con ensalada', extra: 18 }],
    [{ name: 'Extra salmón', price: 15 }, { name: 'Aguacate', price: 8 }, { name: 'Huevo pochado', price: 10 }],
    [{ name: 'Café americano', price: 0 }, { name: 'Jugo verde', price: 15 }, { name: 'Té', price: 8 }]);

  await cp(4, r1.id, catDesayuno.id, 'Omelette de Queso',
    'Omelette relleno de queso cheddar, champiñones y espinacas frescas', 52,
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Con tostadas', extra: 10 }],
    [{ name: 'Tocino', price: 8 }, { name: 'Queso extra', price: 6 }, { name: 'Aguacate', price: 7 }],
    [{ name: 'Café americano', price: 0 }, { name: 'Jugo de naranja', price: 12 }]);

  // ─── HAMBURGUESAS ──────────────────────────────────────
  await cp(5, r1.id, catBurger.id, 'FastBurger Classic',
    'Hamburguesa clásica con carne 100% res, lechuga, tomate y cebolla', 45,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    stdSizes,
    [{ name: 'Extra queso', price: 5 }, { name: 'Doble carne', price: 15 }, { name: 'Jalapeños', price: 3 }, { name: 'Tocino', price: 8 }, { name: 'Aguacate', price: 7 }],
    stdDrinks);

  await cp(6, r2.id, catBurger.id, 'Smoky BBQ Burger',
    'Carne de res con salsa BBQ ahumada, cebolla caramelizada y queso cheddar', 55,
    'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80',
    stdSizes,
    [{ name: 'Extra BBQ', price: 3 }, { name: 'Doble carne', price: 15 }, { name: 'Tocino extra', price: 10 }],
    stdDrinks);

  await cp(7, r3.id, catBurger.id, 'Spicy Habanero',
    'Para los amantes del picante: jalapeños, salsa habanero y queso pepper jack', 58,
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&q=80',
    stdSizes,
    [{ name: 'Extra habanero', price: 4 }, { name: 'Doble jalapeño', price: 5 }, { name: 'Queso extra', price: 5 }],
    stdDrinks);

  await cp(8, r1.id, catBurger.id, 'Mushroom Swiss',
    'Champiñones salteados, queso suizo derretido y mostaza antigua', 57,
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
    stdSizes,
    [{ name: 'Extra champiñones', price: 6 }, { name: 'Doble queso', price: 7 }, { name: 'Tocino', price: 8 }],
    stdDrinks);

  await cp(9, r2.id, catBurger.id, 'FastBurger Doble',
    'Dos carnes, doble queso americano y especias secretas de la casa', 68,
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&q=80',
    [{ name: 'Regular', extra: 0 }, { name: 'XXL', extra: 25 }],
    [{ name: 'Triple carne', price: 20 }, { name: 'Salsa especial', price: 4 }],
    stdDrinks);

  // ─── PIZZAS ────────────────────────────────────────────
  await cp(10, r1.id, catPizza.id, 'Pizza Pepperoni',
    'Salsa de tomate artesanal, mozzarella 100% y pepperoni premium', 75,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    pizzaSizes,
    [{ name: 'Extra pepperoni', price: 10 }, { name: 'Extra mozzarella', price: 8 }, { name: 'Orilla rellena', price: 15 }],
    stdDrinks);

  await cp(11, r2.id, catPizza.id, 'Pizza 4 Quesos',
    'Mozzarella, parmesano, gorgonzola y queso crema sobre base de aceite de oliva', 85,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    pizzaSizes,
    [{ name: 'Extra mozzarella', price: 8 }, { name: 'Albahaca fresca', price: 4 }, { name: 'Orilla rellena', price: 15 }],
    stdDrinks);

  await cp(12, r3.id, catPizza.id, 'Pizza BBQ Chicken',
    'Pollo a la parrilla, salsa BBQ, cebolla morada y cilantro', 82,
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&q=80',
    pizzaSizes,
    [{ name: 'Extra pollo', price: 12 }, { name: 'Extra BBQ', price: 4 }, { name: 'Piña', price: 5 }],
    stdDrinks);

  await cp(13, r1.id, catPizza.id, 'Pizza Vegetariana',
    'Pimientos, champiñones, aceitunas, cebolla y tomates cherry en salsa blanca', 78,
    'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=400&q=80',
    pizzaSizes,
    [{ name: 'Extra verduras', price: 8 }, { name: 'Queso extra', price: 8 }],
    stdDrinks);

  // ─── POLLO ─────────────────────────────────────────────
  await cp(14, r1.id, catPollo.id, 'Alitas Buffalo',
    '12 alitas bañadas en salsa buffalo picante con dip de queso azul', 70,
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80',
    [{ name: '6 piezas', extra: -20 }, { name: '12 piezas', extra: 0 }, { name: '24 piezas', extra: 55 }],
    [{ name: 'Extra salsa buffalo', price: 5 }, { name: 'Salsa BBQ', price: 5 }, { name: 'Papas fritas', price: 15 }],
    stdDrinks);

  await cp(15, r2.id, catPollo.id, 'Pollo Crispy',
    'Pechuga de pollo empanizada y frita con coleslaw y papas', 62,
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Combo familiar', extra: 40 }],
    [{ name: 'Extra coleslaw', price: 6 }, { name: 'Salsa ranch', price: 5 }, { name: 'Queso extra', price: 5 }],
    stdDrinks);

  await cp(16, r3.id, catPollo.id, 'Sandwich de Pollo',
    'Pollo a la parrilla con lechuga, tomate, mayonesa y pan brioche', 55,
    'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&q=80',
    stdSizes,
    [{ name: 'Extra lechuga', price: 3 }, { name: 'Aguacate', price: 7 }, { name: 'Tocino', price: 8 }],
    stdDrinks);

  // ─── TACOS Y WRAPS ─────────────────────────────────────
  await cp(17, r1.id, catTacos.id, 'Tacos de Res',
    '3 tacos de carne de res al carbón con cebolla, cilantro y salsa verde', 48,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
    [{ name: '3 tacos', extra: 0 }, { name: '5 tacos', extra: 25 }, { name: '8 tacos', extra: 50 }],
    [{ name: 'Extra carne', price: 10 }, { name: 'Guacamole', price: 8 }, { name: 'Extra salsa', price: 3 }],
    stdDrinks);

  await cp(18, r2.id, catTacos.id, 'Wrap de Pollo',
    'Tortilla de harina con pollo a la plancha, vegetales frescos y salsa chipotle', 52,
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Combo con papas', extra: 20 }],
    [{ name: 'Extra pollo', price: 10 }, { name: 'Aguacate', price: 7 }, { name: 'Queso extra', price: 5 }],
    stdDrinks);

  await cp(19, r3.id, catTacos.id, 'Burrito Supremo',
    'Burrito grande relleno de carne, arroz, frijoles, queso y guacamole', 65,
    'https://images.unsplash.com/photo-1584208124888-5a8e8ec9dc5f?w=400&q=80',
    [{ name: 'Regular', extra: 0 }, { name: 'XL', extra: 20 }],
    [{ name: 'Extra carne', price: 12 }, { name: 'Extra guacamole', price: 8 }, { name: 'Jalapeños', price: 4 }],
    stdDrinks);

  // ─── PAPAS Y SNACKS ────────────────────────────────────
  await cp(20, r1.id, catPapas.id, 'Papas Fritas Clásicas',
    'Papas fritas crujientes con sal y tu salsa favorita', 28,
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
    [{ name: 'Small', extra: 0 }, { name: 'Medium', extra: 10 }, { name: 'Large', extra: 20 }],
    [{ name: 'Queso cheddar', price: 8 }, { name: 'Tocino', price: 8 }, { name: 'Jalapeños', price: 4 }],
    stdDrinks);

  await cp(21, r2.id, catPapas.id, 'Nachos Supremos',
    'Totopos crujientes con queso cheddar fundido, guacamole y jalapeños', 62,
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80',
    [{ name: 'Regular', extra: 0 }, { name: 'Jumbo', extra: 25 }],
    [{ name: 'Extra guacamole', price: 10 }, { name: 'Carne molida', price: 15 }, { name: 'Crema', price: 5 }],
    stdDrinks);

  await cp(22, r3.id, catPapas.id, 'Aros de Cebolla',
    'Aros de cebolla rebozados y fritos con salsa de mostaza y miel', 35,
    'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80',
    [{ name: 'Regular', extra: 0 }, { name: 'Grande', extra: 15 }],
    [{ name: 'Extra salsa', price: 4 }, { name: 'Queso', price: 6 }],
    stdDrinks);

  // ─── ENSALADAS ─────────────────────────────────────────
  await cp(23, r1.id, catEnsaladas.id, 'Ensalada César',
    'Lechuga romana, crutones, parmesano y aderezo césar casero', 55,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Grande', extra: 20 }],
    [{ name: 'Pollo a la parrilla', price: 15 }, { name: 'Camarones', price: 25 }, { name: 'Extra parmesano', price: 6 }],
    stdDrinks);

  await cp(24, r2.id, catEnsaladas.id, 'Ensalada Mediterránea',
    'Mix de hojas verdes, tomates cherry, aceitunas, pepino y queso feta', 58,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Grande', extra: 20 }],
    [{ name: 'Pollo', price: 15 }, { name: 'Atún', price: 18 }, { name: 'Extra feta', price: 8 }],
    stdDrinks);

  // ─── HOT DOGS ──────────────────────────────────────────
  await cp(25, r1.id, catHotdog.id, 'Hot Dog Clásico',
    'Salchicha de res en pan suave con mostaza, cátsup y cebolla', 30,
    'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Combo con papas', extra: 22 }],
    [{ name: 'Extra mostaza', price: 2 }, { name: 'Queso', price: 5 }, { name: 'Tocino', price: 8 }],
    stdDrinks);

  await cp(26, r2.id, catHotdog.id, 'Hot Dog Chicago',
    'Estilo Chicago con pepinillos, pimientos, cebolla y mostaza amarilla', 38,
    'https://images.unsplash.com/photo-1612392166886-ee8475b03af2?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Combo con papas', extra: 22 }],
    [{ name: 'Extra pepinillos', price: 3 }, { name: 'Jalapeños', price: 4 }, { name: 'Queso extra', price: 5 }],
    stdDrinks);

  // ─── POSTRES ───────────────────────────────────────────
  await cp(27, r1.id, catPostres.id, 'Lava Cake',
    'Pastel de chocolate tibio con centro fundido y helado de vainilla', 38,
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&q=80',
    [{ name: '1 pieza', extra: 0 }, { name: '2 piezas', extra: 30 }],
    [{ name: 'Fresas', price: 8 }, { name: 'Crema batida', price: 5 }, { name: 'Helado extra', price: 10 }],
    [{ name: 'Sin bebida', price: 0 }, { name: 'Café', price: 12 }, { name: 'Leche caliente', price: 10 }]);

  await cp(28, r2.id, catPostres.id, 'Cheesecake de Fresa',
    'Cheesecake cremoso con base de galleta y coulis de fresa fresca', 42,
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
    [{ name: 'Porción', extra: 0 }, { name: 'Porción doble', extra: 35 }],
    [{ name: 'Extra fresas', price: 8 }, { name: 'Crema batida', price: 5 }],
    [{ name: 'Sin bebida', price: 0 }, { name: 'Café', price: 12 }]);

  await cp(29, r3.id, catPostres.id, 'Brownie con Helado',
    'Brownie caliente de chocolate con helado de vainilla y salsa de caramelo', 40,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    [{ name: 'Individual', extra: 0 }, { name: 'Para compartir', extra: 30 }],
    [{ name: 'Extra helado', price: 10 }, { name: 'Nueces', price: 6 }],
    [{ name: 'Sin bebida', price: 0 }, { name: 'Leche fría', price: 10 }]);

  // ─── BEBIDAS ───────────────────────────────────────────
  await cp(30, r1.id, catBebidas.id, 'Smoothie de Frutas',
    'Licuado natural de fresa, mango y maracuyá con leche de almendras', 35,
    'https://images.unsplash.com/photo-1553530666-ba11a90bb5ae?w=400&q=80',
    [{ name: 'Small 12oz', extra: 0 }, { name: 'Medium 16oz', extra: 10 }, { name: 'Large 20oz', extra: 18 }],
    [{ name: 'Extra proteína', price: 12 }, { name: 'Sin azúcar', price: 0 }],
    []);

  await cp(31, r2.id, catBebidas.id, 'Café Frappé',
    'Café frío con leche, caramelo y crema batida, servido sobre hielo', 32,
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
    [{ name: 'Medium', extra: 0 }, { name: 'Large', extra: 10 }],
    [{ name: 'Extra caramelo', price: 5 }, { name: 'Extra espresso', price: 8 }, { name: 'Sin azúcar', price: 0 }],
    []);

  await cp(32, r3.id, catBebidas.id, 'Limonada Especial',
    'Limonada natural con menta fresca, jengibre y un toque de chile', 28,
    'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80',
    [{ name: 'Regular', extra: 0 }, { name: 'Grande', extra: 10 }],
    [{ name: 'Sin chile', price: 0 }, { name: 'Extra menta', price: 3 }],
    []);

  console.log('✅ Productos creados (32 con imágenes)');

  // ─── Ofertas ───────────────────────────────────────────
  await prisma.offer.upsert({ where: { id: 1 }, update: {},
    create: { title: '2x1 en Hamburguesas', description: 'Todos los martes lleva dos hamburguesas al precio de una', discount: 50, code: 'MARTES2X1', startsAt: new Date('2026-01-01'), endsAt: new Date('2026-12-31') } });
  await prisma.offer.upsert({ where: { id: 2 }, update: {},
    create: { title: 'Pizza + Bebida', description: '20% de descuento en tu pizza al agregar una bebida', discount: 20, code: 'PIZZABEBIDA', startsAt: new Date('2026-01-01'), endsAt: new Date('2026-12-31') } });
  await prisma.offer.upsert({ where: { id: 3 }, update: {},
    create: { title: 'Desayuno Feliz', description: '15% off en todos los desayunos antes de las 10am', discount: 15, code: 'DESAYUNO15', startsAt: new Date('2026-01-01'), endsAt: new Date('2026-12-31') } });
  await prisma.offer.upsert({ where: { id: 4 }, update: {},
    create: { title: 'Combo Familiar', description: '25% en pedidos mayores a Q200', discount: 25, code: 'FAMILIA25', startsAt: new Date('2026-01-01'), endsAt: new Date('2026-12-31') } });
  await prisma.offer.upsert({ where: { id: 5 }, update: {},
    create: { title: 'Alitas + Cerveza', description: 'Pide tus alitas y obtén 30% en bebidas', discount: 30, code: 'ALITAS30', startsAt: new Date('2026-01-01'), endsAt: new Date('2026-12-31') } });
  console.log('✅ Ofertas creadas (5)');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('📊 Resumen: 4 usuarios | 3 restaurantes | 10 categorías | 32 productos con imágenes | 5 ofertas');
  console.log('\n📋 Credenciales:');
  console.log('   Admin:   admin@fastbites.com   / Admin123!');
  console.log('   Manager: manager@fastbites.com / Admin123!');
  console.log('   Cliente: cliente@fastbites.com / Client123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });