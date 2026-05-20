import { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { User } from '../../types';

export default function ProfilePage() {
  const { user: authUser, setAuth, token } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userApi.getProfile().then((r) => {
      setUser(r.data.data);
      setName(r.data.data.name);
      setPhone(r.data.data.phone ?? '');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name, phone });
      setUser(res.data.data);
      if (token) setAuth(res.data.data, token);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-gray-400">Cargando perfil...</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-gray-900">Mi perfil</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          ✅ Perfil actualizado correctamente
        </div>
      )}

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center
                          text-2xl font-bold text-brand-600 font-display">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="50212345678" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Teléfono</span>
              <span className="font-medium text-gray-900">{user.phone ?? '—'}</span>
            </div>
            <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-2">
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
