import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center animate-slide-up">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/20
                          rounded-2xl flex items-center justify-center">
            <Flame size={36} className="text-brand-500" />
          </div>
        </div>
        <h1 className="font-display text-8xl text-white tracking-wide mb-2">404</h1>
        <h2 className="font-display text-2xl text-brand-500 tracking-wide mb-4">
          PÁGINA NO ENCONTRADA
        </h2>
        <p className="text-dark-400 mb-8 max-w-sm mx-auto">
          La página que buscas no existe o fue movida.
          Vuelve al inicio y sigue explorando.
        </p>
        <div className="text-6xl mb-8 flex justify-center gap-4 opacity-30">
          🍔 🍕 🌮
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary px-8 py-3">
            Ir al inicio
          </Link>
          <Link to="/products" className="btn-secondary px-8 py-3">
            Ver menú
          </Link>
        </div>
      </div>
    </div>
  );
}