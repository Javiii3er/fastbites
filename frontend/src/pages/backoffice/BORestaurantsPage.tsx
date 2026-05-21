import { useEffect, useState } from 'react';
import { Plus, X, MapPin, Phone, Clock } from 'lucide-react';
import { restaurantApi } from '../../services/api';

interface RestaurantForm {
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}

const emptyForm: RestaurantForm = {
  name: '', address: '', phone: '', latitude: '', longitude: '',
};

const DAY_PART_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Desayuno',
  LUNCH:     '☀️ Almuerzo',
  DINNER:    '🌙 Cena',
};

export default function BORestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<any | null>(null);
  const [form, setForm]               = useState<RestaurantForm>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const load = () => restaurantApi.getAll().then((r) => setRestaurants(r.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      name:      r.name,
      address:   r.address,
      phone:     r.phone ?? '',
      latitude:  String(r.latitude),
      longitude: String(r.longitude),
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.latitude || !form.longitude) {
      setError('Nombre, dirección y coordenadas son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        name:      form.name,
        address:   form.address,
        phone:     form.phone || undefined,
        latitude:  parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      if (editing) {
        await restaurantApi.update(editing.id, data);
      } else {
        await restaurantApi.create(data);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
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
          <h1 className="font-display text-3xl text-white tracking-wide">
            ADMINISTRAR RESTAURANTES
          </h1>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo restaurante
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {restaurants.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-dark-500">
            No hay restaurantes aún
          </div>
        ) : restaurants.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display text-xl text-white tracking-wide">{r.name}</h3>
              <span className="badge-green">Activo</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-dark-400 text-sm">
                <MapPin size={14} className="text-brand-500 shrink-0" />
                {r.address}
              </div>
              {r.phone && (
                <div className="flex items-center gap-2 text-dark-400 text-sm">
                  <Phone size={14} className="text-brand-500 shrink-0" />
                  {r.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-dark-500 text-xs">
                <MapPin size={12} className="shrink-0" />
                {r.latitude}, {r.longitude}
              </div>
            </div>

            {r.dayParts?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-700">
                <div className="flex items-center gap-1.5 text-dark-500 text-xs mb-2">
                  <Clock size={12} />
                  Horarios
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.dayParts.map((dp: any) => (
                    <span key={dp.dayPart}
                      className="text-xs bg-brand-500/10 border border-brand-500/20
                                 text-brand-400 px-2 py-1 rounded-lg">
                      {DAY_PART_LABELS[dp.dayPart] ?? dp.dayPart} {dp.startTime}–{dp.endTime}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
              <button onClick={() => openEdit(r)}
                className="text-xs font-medium text-dark-400 hover:text-white transition-colors">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setShowModal(false)} />
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl
                          w-full max-w-lg shadow-card animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
              <h2 className="font-display text-xl text-white tracking-wide">
                {editing ? 'EDITAR RESTAURANTE' : 'NUEVO RESTAURANTE'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-dark-400 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-brand-500/10 border border-brand-500/30
                                text-brand-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Nombre *
                </label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: FastBites Zona 4" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Dirección *
                </label>
                <input value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ej: 6a Avenida, Zona 4, Guatemala" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Teléfono
                </label>
                <input value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Ej: 25001234" className="input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Latitud *
                  </label>
                  <input type="number" value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="Ej: 14.6407" className="input" step="0.0001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Longitud *
                  </label>
                  <input type="number" value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="Ej: -90.5133" className="input" step="0.0001" />
                </div>
              </div>

              <p className="text-xs text-dark-500">
                💡 Puedes obtener las coordenadas desde Google Maps haciendo clic derecho en el mapa.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-dark-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear restaurante'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}