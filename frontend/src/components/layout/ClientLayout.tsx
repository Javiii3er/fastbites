import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Flame } from 'lucide-react';

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>
      <footer className="border-t border-dark-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
                <Flame size={12} className="text-white" />
              </div>
              <span className="font-display text-lg text-white tracking-wider">
                FAST<span className="text-brand-500">BITES</span>
              </span>
            </div>
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} FastBites — Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}