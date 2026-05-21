import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, LayoutDashboard, Menu, X, Flame } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/',         label: 'Inicio'  },
    { to: '/products', label: 'Menú'    },
    { to: '/offers',   label: 'Ofertas' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center
                            group-hover:bg-brand-600 transition-colors shadow-glow">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl text-white tracking-wider">
              FAST<span className="text-brand-500">BITES</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-dark-800 text-white border border-dark-600'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/60'
                  }`
                }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart"
              className="relative p-2.5 text-dark-300 hover:text-white
                         hover:bg-dark-800 rounded-xl transition-all duration-200">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white
                                 text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full
                                 flex items-center justify-center shadow-glow">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                  <Link to="/admin/dashboard"
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl
                               text-sm font-medium text-dark-300 hover:text-white
                               hover:bg-dark-800 transition-all">
                    <LayoutDashboard size={15} />
                    Admin
                  </Link>
                )}

                {user?.role === 'CLIENT' && (
                  <Link to="/orders"
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl
                               text-sm font-medium text-dark-300 hover:text-white
                               hover:bg-dark-800 transition-all">
                    Mis Pedidos
                  </Link>
                )}

                <Link to="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-2
                             rounded-xl hover:bg-dark-800 transition-all group">
                  <div className="w-7 h-7 bg-brand-500/20 border border-brand-500/30
                                  rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-400">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-dark-300
                                   group-hover:text-white transition-colors">
                    {user?.name.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout}
                  className="hidden md:flex p-2.5 text-dark-500 hover:text-brand-400
                             hover:bg-dark-800 rounded-xl transition-all">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">Ingresar</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Registrarse</Link>
              </div>
            )}

          {/* Mobile hamburger */}
            <button
              className="md:hidden p-2.5 text-dark-300 hover:text-white
                         hover:bg-dark-800 rounded-xl transition-all"
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700 space-y-1 animate-fade-in">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium
                           text-dark-300 hover:text-white hover:bg-dark-800 transition-all">
                {l.label}
              </NavLink>
            ))}
            <div className="divider my-2" />
            {isAuthenticated ? (
              <>
                {user?.role === 'CLIENT' && (
                  <Link to="/orders" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium
                               text-dark-300 hover:text-white hover:bg-dark-800 transition-all">
                    Mis Pedidos
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium
                             text-dark-300 hover:text-white hover:bg-dark-800 transition-all">
                  Mi perfil
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                  <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium
                               text-dark-300 hover:text-white hover:bg-dark-800 transition-all">
                    Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm
                             font-medium text-brand-400 hover:bg-dark-800 transition-all">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="btn-secondary text-sm text-center">Ingresar</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="btn-primary text-sm text-center">Registrarse</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}