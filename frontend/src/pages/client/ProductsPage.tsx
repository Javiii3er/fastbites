import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import type { Product, Category, DayPart } from '../../types';

const getCategoryEmoji = (name?: string) => {
  switch (name) {
    case 'Hamburguesas':  return '🍔';
    case 'Pizzas':        return '🍕';
    case 'Desayunos':     return '🥐';
    case 'Pollo':         return '🍗';
    case 'Tacos y Wraps': return '🌮';
    case 'Papas y Snacks':return '🍟';
    case 'Ensaladas':     return '🥗';
    case 'Hot Dogs':      return '🌭';
    case 'Postres':       return '🍰';
    case 'Bebidas':       return '🥤';
    default:              return '🍽️';
  }
};

const getDayPartInfo = (dayPart?: string) => {
  switch (dayPart) {
    case 'BREAKFAST': return { label: 'Desayuno', emoji: '🌅', time: '6am–11am' };
    case 'LUNCH':     return { label: 'Almuerzo', emoji: '☀️', time: '11am–4pm' };
    case 'DINNER':    return { label: 'Cena',     emoji: '🌙', time: '4pm–10pm' };
    default:          return null;
  }
};

const getCurrentDayPart = () => {
  const hour = new Date().getHours();
  if (hour >= 6  && hour < 11) return 'BREAKFAST';
  if (hour >= 11 && hour < 16) return 'LUNCH';
  return 'DINNER';
};

const DAY_PARTS = [
  { value: 'BREAKFAST', label: 'Desayuno', emoji: '🌅' },
  { value: 'LUNCH',     label: 'Almuerzo', emoji: '☀️' },
  { value: 'DINNER',    label: 'Cena',     emoji: '🌙' },
] as const;

export default function ProductsPage() {
  const [searchParams, setSearchParams]       = useSearchParams();
  const [products, setProducts]               = useState<Product[]>([]);
  const [categories, setCategories]           = useState<Category[]>([]);
  const [total, setTotal]                     = useState(0);
  const [page, setPage]                       = useState(1);
  const [loading, setLoading]                 = useState(true);
  const [selectedDayPart, setSelectedDayPart] = useState<DayPart | null>(null);

  const categoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!)
    : undefined;
  const search = searchParams.get('search') ?? undefined;

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.getAll({
      page,
      limit: 12,
      categoryId,
      search,
      dayPart: selectedDayPart ?? undefined,
    })
      .then((r) => {
        setProducts(r.data.data);
        setTotal(r.data.meta?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page, categoryId, search, selectedDayPart]);

  // Filtrar categorías visibles según DayPart seleccionado
  const visibleCategories = selectedDayPart
    ? categories.filter((c) => c.dayPart === selectedDayPart)
    : categories;

  const totalPages     = Math.ceil(total / 12);
  const currentDayPart = getCurrentDayPart();

  const handleDayPartClick = (dp: DayPart) => {
    setPage(1);
    setSearchParams({});
    setSelectedDayPart((prev) => prev === dp ? null : dp);
  };

  return (
    <div className="space-y-8 animate-slide-up">

      {/* Encabezado */}
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Catálogo
        </p>
        <h1 className="font-display text-4xl text-white tracking-wide">NUESTRO MENÚ</h1>
        <p className="text-dark-400 mt-1">{total} productos disponibles</p>
      </div>

      {/* ─── Filtros DayPart ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {DAY_PARTS.map((dp) => {
          const isActive  = selectedDayPart === dp.value;
          const isCurrent = currentDayPart  === dp.value;
          return (
            <button
              key={dp.value}
              onClick={() => handleDayPartClick(dp.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                          font-semibold border-2 transition-all ${
                isActive
                  ? 'bg-brand-500 border-brand-500 text-white shadow-glow'
                  : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white'
              }`}>
              <span>{dp.emoji}</span>
              <span>{dp.label}</span>
              {isCurrent && !isActive && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </button>
          );
        })}
        {selectedDayPart && (
          <button
            onClick={() => setSelectedDayPart(null)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-dark-400
                       hover:text-white transition-colors">
            ✕ Quitar filtro
          </button>
        )}
      </div>

      {/* ─── Filtros por categoría ───────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Buscar producto..."
            defaultValue={search}
            className="input pl-10"
            onChange={(e) => {
              setPage(1);
              const p = new URLSearchParams(searchParams);
              if (e.target.value) p.set('search', e.target.value);
              else p.delete('search');
              setSearchParams(p);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <SlidersHorizontal size={15} className="text-dark-500" />
          <button
            onClick={() => { setPage(1); setSearchParams({}); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !categoryId
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white'
            }`}>
            Todos
          </button>
          {visibleCategories.map((cat) => (
            <button key={cat.id}
              onClick={() => { setPage(1); setSearchParams({ categoryId: String(cat.id) }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                categoryId === cat.id
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white'
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-dark-700" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-dark-700 rounded w-1/3" />
                <div className="h-4 bg-dark-700 rounded w-3/4" />
                <div className="h-3 bg-dark-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-dark-400 font-medium">
            {selectedDayPart
              ? `No hay productos de ${getDayPartInfo(selectedDayPart)?.label} disponibles`
              : 'No se encontraron productos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card-hover group">
              {/* Imagen */}
              <div className="h-48 bg-dark-700 flex items-center justify-center
                              overflow-hidden relative">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105
                               transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                ) : (
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {getCategoryEmoji(p.category?.name)}
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="text-brand-500 text-xs font-semibold uppercase tracking-widest mb-1">
                  {p.category?.name}
                </p>
                <h3 className="font-semibold text-white group-hover:text-brand-400
                               transition-colors line-clamp-1 mb-1">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-dark-400 text-xs line-clamp-2 leading-relaxed mb-3">
                    {p.description}
                  </p>
                )}

                {/* Badge DayPart */}
                {(() => {
                  const dp          = getDayPartInfo(p.category?.dayPart);
                  const isAvailable = p.category?.dayPart === currentDayPart;
                  if (!dp) return null;
                  return (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                                     font-medium mb-2 w-fit ${
                      isAvailable
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : 'bg-dark-700 border border-dark-600 text-dark-400'
                    }`}>
                      <span>{dp.emoji}</span>
                      <span>{dp.label}</span>
                      <span className="text-dark-500">·</span>
                      <span>{dp.time}</span>
                      {!isAvailable && (
                        <span className="text-dark-500 ml-1">No disponible ahora</span>
                      )}
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between mt-1 pt-3 border-t border-dark-700">
                  <span className="text-white font-bold text-lg">
                    Q{Number(p.basePrice).toFixed(2)}
                  </span>
                  <span className="text-xs bg-brand-500/10 border border-brand-500/20
                                   text-brand-400 px-3 py-1 rounded-full font-medium
                                   group-hover:bg-brand-500 group-hover:text-white transition-all">
                    Ver más
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Paginación — se oculta cuando hay filtro DayPart activo */}
      {totalPages > 1 && !selectedDayPart && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                page === i + 1
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}