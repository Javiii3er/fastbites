import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';

export default function ResetPasswordPage() {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const token                       = searchParams.get('token');

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe contener al menos una mayúscula');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('La contraseña debe contener al menos un número');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token!, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'El enlace es inválido o ya expiró');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center
                          justify-center shadow-glow">
            <span className="text-white font-bold text-lg font-display">F</span>
          </div>
          <span className="font-display text-3xl text-white tracking-wider">
            FAST<span className="text-brand-500">BITES</span>
          </span>
        </div>

        <h2 className="font-display text-4xl text-white tracking-wide mb-2 text-center">
          NUEVA CONTRASEÑA
        </h2>
        <p className="text-dark-400 mb-8 text-center">
          Ingresa tu nueva contraseña para recuperar el acceso
        </p>

        <div className="card p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">✅</div>
              <p className="text-white font-semibold">¡Contraseña actualizada!</p>
              <p className="text-dark-400 text-sm">
                Tu contraseña fue cambiada correctamente. Serás redirigido al login en unos segundos.
              </p>
              <Link to="/login" className="btn-primary inline-block mt-2">
                Ir al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-brand-500/10 border border-brand-500/30
                                text-brand-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-dark-500 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">
                  Mínimo 8 caracteres, una mayúscula y un número
                </p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showConf ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf(!showConf)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-dark-500 hover:text-white transition-colors">
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Actualizando...' : 'Cambiar contraseña'}
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
      </div>
    </div>
  );
}