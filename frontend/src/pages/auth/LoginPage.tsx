import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const res = await authApi.login(data.email, data.password);
      setAuth(res.data.data.user, res.data.data.token);
      const role = res.data.data.user.role;
      navigate(role === 'ADMIN' || role === 'MANAGER' ? '/admin/dashboard' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-900">

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex flex-1 items-center justify-center
                      bg-dark-800 border-r border-dark-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15
                        via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 text-center px-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center
                            justify-center shadow-glow-lg">
              <Flame size={40} className="text-white" />
            </div>
          </div>
          <h1 className="font-display text-7xl text-white tracking-wide">
            FAST<span className="text-brand-500">BITES</span>
          </h1>
          <p className="text-dark-400 mt-4 text-lg">
            Hamburguesas y pizzas artesanales.<br />A tu puerta en minutos.
          </p>
          <div className="flex justify-center gap-6 mt-10 text-5xl opacity-20">
            {['🍔', '🍕', '🌮', '🍟'].map((e, i) => (
              <span key={i} style={{ transform: `rotate(${(i - 1.5) * 10}deg)` }}>
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Botón volver */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-dark-400 hover:text-white
                       transition-colors text-sm font-medium group mb-8">
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Volver
          </button>

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl text-white">
              FAST<span className="text-brand-500">BITES</span>
            </span>
          </div>

          <h2 className="font-display text-4xl text-white tracking-wide mb-1">
            BIENVENIDO
          </h2>
          <p className="text-dark-400 mb-8">Ingresa a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-brand-500/10 border border-brand-500/30
                              text-brand-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                <input {...register('email')} type="email"
                  placeholder="tu@email.com" className="input pl-10" />
              </div>
              {errors.email && (
                <p className="text-brand-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500
                             hover:text-dark-300 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-brand-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password"
                className="text-sm text-dark-400 hover:text-brand-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base">
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-8">
            ¿No tienes cuenta?{' '}
            <Link to="/register"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}