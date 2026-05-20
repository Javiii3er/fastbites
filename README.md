# 🍔 FastBites — Sistema de Comercio Electrónico

Aplicación web fullstack para gestión de pedidos de comida rápida.  
Stack: **React + Vite + TypeScript** (frontend) · **Node.js + Express + Prisma + MySQL** (backend)

---

## 📁 Estructura del repositorio

```
fastbites/
├── backend/     # API REST — Express + Prisma + MySQL
├── frontend/    # SPA    — React + Vite + Tailwind
└── docs/        # Documentación del proyecto
```

---

## 🚀 Primeros pasos

### Requisitos previos
- Node.js 18 o superior
- MySQL corriendo localmente (usar MySQL Workbench para gestionar)
- Git

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/fastbites.git
cd fastbites
```

---

### 2. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu usuario y contraseña de MySQL

# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma migrate dev --name init

# Cargar datos de prueba (seed)
npm run prisma:seed

# Iniciar en modo desarrollo
npm run dev
```

El backend corre en: `http://localhost:4000`  
Health check: `http://localhost:4000/health`

---

### 3. Configurar el Frontend

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Verificar que VITE_API_BASE_URL=http://localhost:4000/api

# Iniciar en modo desarrollo
npm run dev
```

El frontend corre en: `http://localhost:5173`

---

## 🔑 Credenciales de prueba (generadas por el seed)

| Rol     | Email                    | Contraseña  |
|---------|--------------------------|-------------|
| Admin   | admin@fastbites.com      | Admin123!   |
| Manager | manager@fastbites.com    | Admin123!   |
| Cliente | cliente@fastbites.com    | Client123!  |

---

## 🗺️ Rutas principales

### Sistema Cliente
| Ruta              | Descripción                    |
|-------------------|--------------------------------|
| `/`               | Página de inicio               |
| `/products`       | Catálogo de productos          |
| `/products/:id`   | Detalle y personalización      |
| `/cart`           | Carrito de compras             |
| `/checkout`       | Proceso de pago                |
| `/orders`         | Historial de pedidos           |
| `/offers`         | Ofertas disponibles            |
| `/profile`        | Mi perfil                      |

### Backoffice (Admin/Manager)
| Ruta                   | Descripción           |
|------------------------|-----------------------|
| `/admin/dashboard`     | Panel principal       |
| `/admin/orders`        | Gestión de pedidos    |
| `/admin/products`      | Gestión de productos  |
| `/admin/offers`        | Gestión de ofertas    |
| `/admin/restaurants`   | Gestión de locales    |
| `/admin/users`         | Gestión de usuarios   |
| `/admin/reports`       | Reportería            |

### API Endpoints principales
| Método | Ruta                     | Descripción                    |
|--------|--------------------------|--------------------------------|
| POST   | `/api/auth/register`     | Crear cuenta                   |
| POST   | `/api/auth/login`        | Iniciar sesión                 |
| GET    | `/api/auth/me`           | Usuario actual                 |
| GET    | `/api/products`          | Listar productos (paginado)    |
| GET    | `/api/categories`        | Listar categorías              |
| POST   | `/api/orders`            | Crear pedido                   |
| GET    | `/api/orders/my`         | Mis pedidos                    |
| GET    | `/api/offers`            | Ofertas vigentes               |
| GET    | `/api/reports/sales/by-day` | Ventas por día             |

---

## 🛠️ Comandos útiles

```bash
# Ver la base de datos visualmente (Prisma Studio)
cd backend && npx prisma studio

# Limpiar y re-seedear la base de datos
cd backend && npx prisma migrate reset

# Build para producción
cd backend  && npm run build
cd frontend && npm run build
```

---

## ☁️ Deploy

| Servicio  | Para qué                        | Gratis |
|-----------|---------------------------------|--------|
| **Vercel**  | Frontend (React)              | ✅     |
| **Railway** | Backend + MySQL               | ✅     |

Pasos de deploy en `/docs/DEPLOY.md`

---

## 👥 Equipo

| Nombre | Rol |
|--------|-----|
|        | PM / Desarrollador principal |
|        | Desarrollador / Documentación |

---

## 📄 Licencia
Proyecto académico — Curso de Ingeniería de Software 2026
