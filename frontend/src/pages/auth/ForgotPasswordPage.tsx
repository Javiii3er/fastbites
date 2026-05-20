import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-brand-500">FastBites</h1>
          <p className="text-gray-500 mt-2">Recuperar contraseña</p>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-green-600 font-medium">¡Listo! Revisa tu correo.</p>
              <Link to="/login" className="btn-primary mt-4 inline-block">Volver al login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" className="input" required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-brand-500 hover:underline">Volver al login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
