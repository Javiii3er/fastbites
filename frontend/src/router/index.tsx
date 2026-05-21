import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import NotFoundPage from '../pages/NotFoundPage';

// Layouts
import ClientLayout from '../components/layout/ClientLayout';
import BackofficeLayout from '../components/layout/BackofficeLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Client pages
import HomePage from '../pages/client/HomePage';
import ProductsPage from '../pages/client/ProductsPage';
import ProductDetailPage from '../pages/client/ProductDetailPage';
import CartPage from '../pages/client/CartPage';
import CheckoutPage from '../pages/client/CheckoutPage';
import OrdersPage from '../pages/client/OrdersPage';
import OffersPage from '../pages/client/OffersPage';
import ProfilePage from '../pages/client/ProfilePage';

// Backoffice pages
import DashboardPage from '../pages/backoffice/DashboardPage';
import BOProductsPage from '../pages/backoffice/BOProductsPage';
import BOOrdersPage from '../pages/backoffice/BOOrdersPage';
import BOOffersPage from '../pages/backoffice/BOOffersPage';
import BORestaurantsPage from '../pages/backoffice/BORestaurantsPage';
import BOUsersPage from '../pages/backoffice/BOUsersPage';
import BOReportsPage from '../pages/backoffice/BOReportsPage';

// ─── Guards ───────────────────────────────────────────────────────────────────
const RequireAuth = ({ roles }: { roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

const GuestOnly = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // ── Auth (solo para no autenticados)
  {
    element: <GuestOnly />,
    children: [
      { path: '/login',           element: <LoginPage />          },
      { path: '/register',        element: <RegisterPage />       },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // ── Sistema Cliente
  {
    element: <ClientLayout />,
    children: [
      { path: '/',             element: <HomePage />          },
      { path: '/products',     element: <ProductsPage />      },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/offers',       element: <OffersPage />        },

      // Requiere login
      {
        element: <RequireAuth roles={['CLIENT', 'ADMIN', 'MANAGER']} />,
        children: [
          { path: '/cart',     element: <CartPage />     },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/orders',   element: <OrdersPage />   },
          { path: '/profile',  element: <ProfilePage />  },
        ],
      },
    ],
  },

  // ── Backoffice (ADMIN + MANAGER)
  {
    path: '/admin',
    element: <RequireAuth roles={['ADMIN', 'MANAGER']} />,
    children: [
      {
        element: <BackofficeLayout />,
        children: [
          { index: true,       element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage />  },
          { path: 'products',  element: <BOProductsPage /> },
          { path: 'orders',    element: <BOOrdersPage />   },
          { path: 'offers',    element: <BOOffersPage />   },
          { path: 'reports',   element: <BOReportsPage />  },

          // Solo ADMIN
          {
            element: <RequireAuth roles={['ADMIN']} />,
            children: [
              { path: 'restaurants', element: <BORestaurantsPage /> },
              { path: 'users',       element: <BOUsersPage />       },
            ],
          },
        ],
      },
    ],
  },

  // ── Catch-all
  { path: '*', element: <NotFoundPage /> },
]);