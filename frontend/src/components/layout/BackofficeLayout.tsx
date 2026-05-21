import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Store, Users, BarChart2, LogOut, Flame, ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const adminLinks = [
  { to: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/orders',      label: 'Pedidos',      icon: ShoppingBag     },
  { to: '/admin/products',    label: 'Productos',    icon: Package         },
  { to: '/admin/offers',      label: 'Ofertas',      icon: Tag             },
  { to: '/admin/restaurants', label: 'Restaurantes', icon: Store           },
  { to: '/admin/users',       label: 'Usuarios',     icon: Users           },
  { to: '/admin/reports',     label: 'Reportería',   icon: BarChart2       },
];

const managerLinks = [
  { to: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/orders',      label: 'Pedidos',      icon: ShoppingBag     },
  { to: '/admin/products',    label: 'Productos',    icon: Package         },
  { to: '/admin/offers',      label: 'Ofertas',      icon: Tag             },
  { to: '/admin/reports',     label: 'Reportería',   icon: BarChart2       },
];

const ROL_LABELS: Record<string, string> = {
  ADMIN:   'Administrador',
  MANAGER: 'Manager',
  CLIENT:  'Cliente',
};

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = user?.role === 'ADMIN' ? adminLinks : managerLinks;

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center
                            shadow-glow group-hover:bg-brand-600 transition-colors">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display text-xl text-white tracking-wider">
              FAST<span className="text-brand-500">BITES</span>
            </span>
          </Link>
          <p className="text-dark-500 text-xs mt-1 ml-10">Panel Administrativo</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                 transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                }`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-dark-700 space-y-1">
          <Link to="/"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm
                       font-medium text-dark-400 hover:bg-dark-800 hover:text-white transition-all">
            <ExternalLink size={16} />
            Ir al sitio
          </Link>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-brand-500/15 border border-brand-500/20 rounded-lg
                            flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-400">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <span className="text-xs text-brand-500">
                {ROL_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm
                       font-medium text-dark-500 hover:bg-dark-800 hover:text-brand-400
                       transition-all">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 bg-dark-900 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}