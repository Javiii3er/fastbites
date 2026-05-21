import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { authApi } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg font-display">F</span>
          </div>
          <span className="font-display text-3xl text-white tracking-wider">
            FAST<span className="text-brand-500">BITES</span>
          </span>
        </div>

        <h2 className="font-display text-4xl text-white tracking-wide mb-2 text-center">
          RECUPERAR CUENTA
        </h2>
        <p className="text-dark-400 mb-8 text-center">
          Te enviaremos instrucciones a tu correo
        </p>

        <div className="card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <p className="text-white font-semibold">¡Correo enviado!</p>
              <p className="text-dark-400 text-sm">
                Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu cuenta.
              </p>
              <Link to="/login" className="btn-primary inline-block mt-2">
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>

              <p className="text-center text-sm text-dark-500">
                <Link to="/login"
                  className="text-brand-400 hover:text-brand-300 transition-colors">
                  ← Volver al login
                </Link>
              </p>
            </form>
          )}
        </div>

        {/* Nota sobre recuperación */}
        <div className="mt-4 p-4 bg-dark-800 border border-dark-700 rounded-xl">
          <p className="text-xs text-dark-500 text-center">
            ¿No recuerdas tu correo? Contacta al administrador en{' '}
            <span className="text-brand-400">admin@fastbites.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}