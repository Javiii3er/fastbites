import { useEffect, useState } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import type { Product, Category } from '../../types';

interface ProductForm {
  name: string;
  description: string;
  basePrice: string;
  categoryId: string;
  restaurantId: string;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: '', description: '', basePrice: '',
  categoryId: '', restaurantId: '1', imageUrl: '',
};

const PAGE_SIZE = 10;

export default function BOProductsPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<Product | null>(null);
  const [form, setForm]               = useState<ProductForm>(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [showInactive, setShowInactive] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      productApi.getAll({ limit: 100, ...(showInactive && { showAll: 'true' }) } as any),
      categoryApi.getAll(),
    ]).then(([p, c]) => {
      setProducts(p.data.data);
      setCategories(c.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [showInactive]);

  // Filtrar por búsqueda
  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category?.name.toLowerCase().includes(q)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset página al buscar
  useEffect(() => { setPage(1); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name:         p.name,
      description:  p.description ?? '',
      basePrice:    String(p.basePrice),
      categoryId:   String(p.category?.id ?? ''),
      restaurantId: String((p as any).restaurantId ?? '1'),
      imageUrl:     p.imageUrl ?? '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.basePrice || !form.categoryId) {
      setError('Nombre, precio y categoría son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        name:         form.name,
        description:  form.description || undefined,
        basePrice:    parseFloat(form.basePrice),
        categoryId:   parseInt(form.categoryId),
        restaurantId: parseInt(form.restaurantId),
        imageUrl:     form.imageUrl || undefined,
      };
      if (editing) {
        await productApi.update(editing.id, data);
      } else {
        await productApi.create(data);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryEmoji = (dayPart?: string) => {
    if (dayPart === 'BREAKFAST') return '🥐';
    if (dayPart === 'DINNER')    return '🍕';
    return '🍔';
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
            ADMINISTRAR PRODUCTOS
          </h1>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {/* Buscador + filtro inactivos */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="input pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500
                         hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowInactive(!showInactive)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
            showInactive
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-white'
          }`}>
          {showInactive ? '👁 Mostrando todos' : '👁 Ver inactivos'}
        </button>
        <p className="text-dark-500 text-sm">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-dark-700">
            <tr>
              {['', 'ID', 'Nombre', 'Categoría', 'Precio base', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold
                                       text-dark-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-dark-500">
                  Cargando...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-dark-500">
                  {search ? `No se encontraron productos para "${search}"` : 'No hay productos'}
                </td>
              </tr>
            ) : paginated.map((p) => (
              <tr key={p.id}
                className={`hover:bg-dark-700/50 transition-colors ${
                  !(p as any).isActive ? 'opacity-50' : ''
                }`}>
                {/* Miniatura */}
                <td className="px-3 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-700
                                  flex items-center justify-center text-xl shrink-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                    ) : (
                      <span>{getCategoryEmoji(p.category?.dayPart)}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-dark-500 text-xs">#{p.id}</td>
                <td className="px-5 py-4 font-medium text-white">{p.name}</td>
                <td className="px-5 py-4 text-dark-400">{p.category?.name}</td>
                <td className="px-5 py-4 font-semibold text-brand-400">
                  Q{Number(p.basePrice).toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <span className={(p as any).isActive ? 'badge-green' : 'badge-gray'}>
                    {(p as any).isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(p)}
                      className="text-xs font-medium text-dark-400 hover:text-white
                                 transition-colors">
                      Editar
                    </button>
                    <button onClick={async () => { await productApi.toggle(p.id); load(); }}
                      className="text-xs font-medium text-brand-400 hover:text-brand-300
                                 transition-colors">
                      {(p as any).isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-dark-700">
            <p className="text-dark-500 text-xs">
              Página {page} de {totalPages} — {filtered.length} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-dark-700 border border-dark-600
                           text-dark-300 hover:text-white disabled:opacity-40
                           disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    page === i + 1
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-dark-700 border border-dark-600 text-dark-300 hover:text-white'
                  }`}>
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-dark-700 border border-dark-600
                           text-dark-300 hover:text-white disabled:opacity-40
                           disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setShowModal(false)} />
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl
                          w-full max-w-lg shadow-card animate-slide-up
                          max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700
                            sticky top-0 bg-dark-800 z-10">
              <h2 className="font-display text-xl text-white tracking-wide">
                {editing ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
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
                  Nombre del producto *
                </label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: FastBurger Especial" className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Descripción
                </label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  className="input resize-none h-20" />
              </div>

              {/* URL de imagen */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  URL de imagen
                </label>
                <input value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="input" />
                {form.imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden h-32 bg-dark-700">
                    <img src={form.imageUrl} alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }} />
                  </div>
                )}
                <p className="text-xs text-dark-500 mt-1.5">
                  💡 Pega una URL de imagen. Fotos gratis en{' '}
                  <a href="https://unsplash.com" target="_blank" rel="noreferrer"
                    className="text-brand-400 hover:underline">Unsplash</a>
                  {' '}o{' '}
                  <a href="https://www.pexels.com" target="_blank" rel="noreferrer"
                    className="text-brand-400 hover:underline">Pexels</a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Precio base (Q) *
                  </label>
                  <input type="number" value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    placeholder="0.00" className="input" min="0" step="0.50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">
                    Categoría *
                  </label>
                  <select value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="input">
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Restaurante
                </label>
                <select value={form.restaurantId}
                  onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
                  className="input">
                  <option value="1">FastBites Zona 1</option>
                  <option value="2">FastBites Zona 10</option>
                  <option value="3">FastBites Miraflores</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-dark-700
                            sticky bottom-0 bg-dark-800">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}