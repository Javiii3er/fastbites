import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const res = await authApi.register({
        name:     data.name,
        email:    data.email,
        password: data.password,
        phone:    data.phone || undefined,
      });
      setAuth(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al crear la cuenta');
    }
  };

  const basicFields = [
    { name: 'name'  as const, label: 'Nombre completo',     type: 'text',  placeholder: 'Juan Pérez'   },
    { name: 'email' as const, label: 'Correo electrónico',  type: 'email', placeholder: 'tu@email.com' },
    { name: 'phone' as const, label: 'Teléfono (opcional)', type: 'tel',   placeholder: '50212345678'  },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        {/* Botón volver */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dark-400 hover:text-white
                     transition-colors text-sm font-medium group mb-6">
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Volver
        </button>

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
          CREAR CUENTA
        </h2>
        <p className="text-dark-400 mb-8 text-center">Únete y empieza a pedir</p>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-brand-500/10 border border-brand-500/30
                              text-brand-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Campos básicos */}
            {basicFields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  {f.label}
                </label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="input"
                />
                {errors[f.name] && (
                  <p className="text-brand-400 text-xs mt-1">{errors[f.name]?.message}</p>
                )}
              </div>
            ))}

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                />
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

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500
                             hover:text-dark-300 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-brand-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="btn-primary w-full py-3 mt-2">
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Ingresar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}