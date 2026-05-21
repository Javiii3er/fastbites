import { useEffect, useState } from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';
import { userApi } from '../../services/api';
import api from '../../services/http';

const ROL_COLORS: Record<string, string> = {
  ADMIN:   'badge-red',
  MANAGER: 'badge-yellow',
  CLIENT:  'badge-blue',
};

const ROL_LABELS: Record<string, string> = {
  ADMIN:   'Administrador',
  MANAGER: 'Manager',
  CLIENT:  'Cliente',
};

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'CLIENT';
}

const emptyForm: UserForm = {
  name: '', email: '', password: '', phone: '', role: 'CLIENT',
};

export default function BOUsersPage() {
  const [users, setUsers]         = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<UserForm>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Reset contraseña
  const [showReset, setShowReset]       = useState<number | null>(null);
  const [newPassword, setNewPassword]   = useState('');
  const [resetting, setResetting]       = useState(false);
  const [resetError, setResetError]     = useState('');

  const load = () => userApi.getAll().then((r) => setUsers(r.data.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Nombre, email y contraseña son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/users/create', {
        name:     form.name,
        email:    form.email,
        password: form.password,
        phone:    form.phone || undefined,
        role:     form.role,
      });
      setShowModal(false);
      setForm(emptyForm);
      load();
      setSuccess('Usuario creado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (userId: number) => {
    if (!newPassword || newPassword.length < 8) {
      setResetError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setResetting(true);
    setResetError('');
    try {
      await api.patch(`/users/${userId}/reset-password`, { password: newPassword });
      setShowReset(null);
      setNewPassword('');
      setSuccess('Contraseña actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setResetError(err.response?.data?.message ?? 'Error al actualizar contraseña');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">
            Backoffice
          </p>
          <h1 className="font-display text-3xl text-white tracking-wide">ADMINISTRAR USUARIOS</h1>
        </div>
        <button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}
          className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400
                        text-sm rounded-xl px-4 py-3">
          ✅ {success}
        </div>
      )}

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-dark-700">
            <tr>
              {['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold
                                       text-dark-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-dark-700/50 transition-colors">
                <td className="px-5 py-4 font-medium text-white">{u.name}</td>
                <td className="px-5 py-4 text-dark-400">{u.email}</td>
                <td className="px-5 py-4 text-dark-500">{u.phone ?? '—'}</td>
                <td className="px-5 py-4">
                  <span className={ROL_COLORS[u.role] ?? 'badge-gray'}>
                    {ROL_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={u.isActive ? 'badge-green' : 'badge-gray'}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setShowReset(u.id); setNewPassword(''); setResetError(''); }}
                      className="text-xs font-medium text-dark-400 hover:text-white
                                 transition-colors flex items-center gap-1">
                      <RefreshCw size={12} />
                      Reset contraseña
                    </button>
                    <button
                      onClick={async () => { await userApi.toggle(u.id); load(); }}
                      className="text-xs font-medium text-brand-400 hover:text-brand-300
                                 transition-colors">
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setShowModal(false)} />
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl
                          w-full max-w-md shadow-card animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
              <h2 className="font-display text-xl text-white tracking-wide">NUEVO USUARIO</h2>
              <button onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-brand-500/10 border border-brand-500/30
                                text-brand-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Nombre completo *
                </label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan Pérez" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Correo electrónico *
                </label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@email.com" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Teléfono
                </label>
                <input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="50212345678" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Contraseña temporal *
                </label>
                <input type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Rol
                </label>
                <select value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserForm['role'] })}
                  className="input">
                  <option value="CLIENT">Cliente</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-dark-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset contraseña */}
      {showReset !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setShowReset(null)} />
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl
                          w-full max-w-sm shadow-card animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
              <h2 className="font-display text-xl text-white tracking-wide">
                RESETEAR CONTRASEÑA
              </h2>
              <button onClick={() => setShowReset(null)}
                className="text-dark-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-dark-400 text-sm">
                Ingresa la nueva contraseña para el usuario. El usuario deberá
                cambiarla en su próximo inicio de sesión.
              </p>

              {resetError && (
                <p className="text-red-400 text-xs">{resetError}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-dark-700">
              <button onClick={() => setShowReset(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={() => handleReset(showReset)}
                disabled={resetting}
                className="btn-primary flex-1">
                {resetting ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}