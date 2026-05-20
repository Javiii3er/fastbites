import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/products', label: 'Menú' },
    { to: '/offers', label: 'Ofertas' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-extrabold text-brand-500">
            FastBites
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive ? 'text-brand-500' : 'text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-brand-500 transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs font-bold
                                 w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                  <Link to="/admin/dashboard" className="hidden md:flex items-center gap-1.5 text-sm
                         font-semibold text-gray-600 hover:text-brand-500 transition-colors">
                    <LayoutDashboard size={16} />
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="hidden md:flex items-center gap-1.5 text-sm
                       font-semibold text-gray-600 hover:text-brand-500 transition-colors">
                  <User size={16} />
                  {user?.name.split(' ')[0]}
                </Link>
                <button onClick={handleLogout}
                  className="hidden md:flex items-center gap-1.5 text-sm font-semibold
                             text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={16} />
                  Salir
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Ingresar</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Registrarse</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-brand-500 py-1">
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-gray-700">Mi perfil</Link>
                <button onClick={handleLogout} className="text-sm font-semibold text-red-500 text-left">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm">Ingresar</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm">Registrarse</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
