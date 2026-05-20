import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Store, Users, BarChart2, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { to: '/admin/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/orders',      label: 'Pedidos',        icon: ShoppingBag },
  { to: '/admin/products',    label: 'Productos',      icon: Package },
  { to: '/admin/offers',      label: 'Ofertas',        icon: Tag },
  { to: '/admin/restaurants', label: 'Restaurantes',   icon: Store },
  { to: '/admin/users',       label: 'Usuarios',       icon: Users },
  { to: '/admin/reports',     label: 'Reportería',     icon: BarChart2 },
];

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="font-display text-xl font-extrabold text-brand-500">FastBites</span>
          <p className="text-xs text-gray-500 mt-0.5">Panel Administrativo</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Conectado como</p>
            <p className="text-sm text-white font-medium truncate">{user?.name}</p>
            <span className="text-xs text-brand-400">{user?.role}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm
                       font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
