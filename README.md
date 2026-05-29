#  FastBites — Sistema de Comercio Electrónico de Comida Rápida

Aplicación web fullstack para gestión de pedidos de comida rápida.  
Stack: **React 18 + Vite + TypeScript + Tailwind CSS** (frontend) · **Node.js 18 + Express + Prisma + MySQL 8** (backend)

---

##  Estructura del repositorio

```
fastbites/
├── backend/     # API REST — Express + Prisma + MySQL
├── frontend/    # SPA    — React + Vite + Tailwind
└── docs/        # Documentación del proyecto
```

---

##  Primeros pasos

### Requisitos previos
- Node.js 18 o superior
- MySQL 8.0 corriendo localmente
- Git

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Javiii3er/fastbites.git
cd fastbites
```

---

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env con las siguientes variables:
# DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/fastbites"
# JWT_SECRET="fastbites-secret-key-2026"
# PORT=4000
# NODE_ENV=development
# RESEND_API_KEY=tu_api_key_de_resend
# FRONTEND_URL=http://localhost:5173

# Crear la base de datos en MySQL Workbench:
# CREATE DATABASE fastbites;

# Aplicar migraciones
npx prisma migrate deploy

# Generar el cliente de Prisma
npx prisma generate

# Cargar datos de prueba
npm run prisma:seed

# Iniciar en modo desarrollo
npm run dev
```

El backend corre en: `http://localhost:4000`  
Health check: `http://localhost:4000/health`

---

### 3. Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env con:
# VITE_API_URL=http://localhost:4000/api

# Iniciar en modo desarrollo
npm run dev
```

El frontend corre en: `http://localhost:5173`

---

### 4. Si ya tienes el repo clonado y hay cambios nuevos

```bash
git pull
cd backend && npm install
npx prisma migrate deploy
npx prisma generate
cd ../frontend && npm install
```

---

##  Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@fastbites.com | Admin123! |
| Manager | manager@fastbites.com | Admin123! |
| Cliente | ingenieriasoftware74@fastbites.com | Cliente123! |
| Cliente 2 | maria@email.com | Cliente123! |

---

##  Rutas principales

### Sistema Cliente
| Ruta | Descripción |
|---|---|
| `/` | Página de inicio |
| `/products` | Catálogo con filtros por DayPart |
| `/products/:id` | Detalle y personalización del producto |
| `/cart` | Carrito de compras |
| `/checkout` | Proceso de pago |
| `/orders` | Historial de pedidos |
| `/offers` | Ofertas disponibles |
| `/profile` | Mi perfil |
| `/forgot-password` | Recuperar contraseña |
| `/reset-password` | Restablecer contraseña |

### Backoffice (Admin/Manager)
| Ruta | Descripción |
|---|---|
| `/admin/dashboard` | Panel principal con estadísticas |
| `/admin/orders` | Gestión de pedidos |
| `/admin/products` | Gestión de productos |
| `/admin/offers` | Gestión de ofertas |
| `/admin/restaurants` | Gestión de locales y Daypart (solo Admin) |
| `/admin/users` | Gestión de usuarios (solo Admin) |
| `/admin/reports` | Reportería de ventas |

### API Endpoints principales
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/forgot-password` | Solicitar recuperación |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| GET | `/api/products` | Listar productos (paginado, filtros) |
| GET | `/api/categories` | Listar categorías |
| GET | `/api/cart` | Ver carrito del usuario |
| POST | `/api/cart` | Agregar al carrito |
| POST | `/api/orders` | Crear pedido |
| GET | `/api/orders/my` | Mis pedidos |
| PATCH | `/api/orders/:id/cancel` | Cancelar pedido (cliente) |
| GET | `/api/offers` | Ofertas vigentes |
| GET | `/api/reports/sales/by-day` | Ventas por día con detalle |
| GET | `/api/reports/sales/by-daypart` | Ventas por horario |
| GET | `/api/reports/summary` | Resumen general |
| GET | `/api/reports/top-products` | Top productos más vendidos |

---

##  Base de datos

El sistema cuenta con **16 tablas** en MySQL 8.0 gestionadas con Prisma ORM:

`users` · `restaurants` · `restaurant_day_parts` · `categories` · `products` · `product_sizes` · `addons` · `drinks` · `offers` · `addresses` · `payment_methods` · `orders` · `order_items` · `order_item_addons` · `cart_items` · `password_reset_tokens`

---

##  Comandos útiles

```bash
# Ver la base de datos visualmente
cd backend && npx prisma studio

# Verificar sincronización de migraciones
cd backend && npx prisma migrate status

# Limpiar y re-seedear la base de datos
cd backend && npx prisma migrate reset

# Build para producción
cd backend  && npm run build
cd frontend && npm run build
```

---

##  Funcionalidades principales

-  Autenticación JWT con roles (ADMIN, MANAGER, CLIENT)
-  Recuperación de contraseña por email real (Resend)
-  Carrito persistido en base de datos por usuario
-  Sistema de Daypart (Desayuno / Almuerzo / Cena)
-  Cupones de descuento con validaciones específicas
-  Reportería con resumen, top productos y detalle de pedidos
-  Gestión de productos y ofertas activos e inactivos
-  Métodos de pago y direcciones guardadas por usuario

---

##  Equipo de desarrollo

| Nombre | Carné | Rol |
|---|---|---|
| Javier José Luis Rivera Pérez | 1790-22-10552 | Líder / Desarrollador Principal |
| Karla Waleska Rodríguez Arévalo | 1790-22-9763 | Desarrolladora / Documentación |
| Cesar Ulises Gonzáles Cardona | 1790-22-6044 | Desarrollador / QA |
| Paolo Alexander Marroquín de la Cruz | 1790-22-8967 | Documentador Técnico |
| José Daniel Bran Benito | 1790-22-15044 | Documentador Técnico |
| Gelen Dayanna López Morales | 1790-21-14904 | Documentador Técnico |
| Jaquelin Natalia Lorenzana León | 1790-22-13193 | Documentador Técnico |
| Milton Adrián Martínez Ávila | 1790-22-9129 | Documentador Técnico |

---

##  Información académica

- **Universidad:** Mariano Gálvez de Guatemala
- **Facultad:** Ingeniería en Sistemas de Información y Ciencias de la Computación
- **Curso:** Ingeniería de Software
- **Catedrático:** Ing. Josue David Cojom Guarcas
- **Año:** 2026

---

##  Licencia

Proyecto académico — Curso de Ingeniería de Software 2026
