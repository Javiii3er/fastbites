import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { offerApi } from '../../services/api';

interface OfferForm {
  title: string;
  description: string;
  discount: string;
  code: string;
  startsAt: string;
  endsAt: string;
}

const emptyForm: OfferForm = {
  title: '', description: '', discount: '', code: '',
  startsAt: '', endsAt: '',
};

export default function BOOffersPage() {
  const [offers, setOffers]       = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<any | null>(null);
  const [form, setForm]           = useState<OfferForm>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => offerApi.getAll().then((r) => setOffers(r.data.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (o: any) => {
    setEditing(o);
    setForm({
      title:       o.title,
      description: o.description ?? '',
      discount:    String(o.discount),
      code:        o.code ?? '',
      startsAt:    o.startsAt?.split('T')[0] ?? '',
      endsAt:      o.endsAt?.split('T')[0] ?? '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.discount || !form.startsAt || !form.endsAt) {
      setError('Título, descuento y fechas son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        title:       form.title,
        description: form.description || undefined,
        discount:    parseFloat(form.discount),
        code:        form.code || undefined,
        startsAt:    form.startsAt,
        endsAt:      form.endsAt,
        isActive:    true,
      };
      if (editing) {
        await offerApi.update(editing.id, data);
      } else {
        await offerApi.create(data);
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
          <h1 className="font-display text-3xl text-white tracking-wide">ADMINISTRAR OFERTAS</h1>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva oferta
        </button>
      </div>

      {/* Grid de ofertas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {offers.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-dark-500">
            No hay ofertas aún
          </div>
        ) : offers.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="badge-red font-bold px-3 py-1">-{o.discount}% OFF</span>
              <span className={o.isActive ? 'badge-green' : 'badge-gray'}>
                {o.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <h3 className="font-display text-xl text-white tracking-wide">{o.title}</h3>
            {o.description && (
              <p className="text-dark-400 text-sm mt-1">{o.description}</p>
            )}
            {o.code && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-dark-500">Código:</span>
                <span className="font-mono font-bold text-brand-400 bg-brand-500/10
                                 border border-brand-500/20 px-2 py-0.5 rounded text-sm">
                  {o.code}
                </span>
              </div>
            )}
            <p className="text-xs text-dark-600 mt-2">
              Válido: {o.startsAt?.split('T')[0]} → {o.endsAt?.split('T')[0]}
            </p>
            <div className="flex gap-3 mt-4 pt-4 border-t border-dark-700">
              <button onClick={() => openEdit(o)}
                className="text-xs font-medium text-dark-400 hover:text-white transition-colors">
                Editar
              </button>
              <button onClick={async () => { await offerApi.toggle(o.id); load(); }}
                className={`text-xs font-semibold transition-colors ${
                  o.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                }`}>
                {o.isActive ? 'Desactivar' : 'Activar'}
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
                {editing ? 'EDITAR OFERTA' : 'NUEVA OFERTA'}
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
                  Título *
                </label>
                <input value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: 2x1 en Hamburguesas" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Descripción
                </label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción de la oferta..."
                  className="input resize-none h-16" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Descuento (%) *
                  </label>
                  <input type="number" value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="Ej: 20" className="input" min="1" max="100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Código (opcional)
                  </label>
                  <input value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: PROMO20" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Fecha inicio *
                  </label>
                  <input type="date" value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Fecha fin *
                  </label>
                  <input type="date" value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="input" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-dark-700">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear oferta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}