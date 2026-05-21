import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import type { Product, Category } from '../../types';

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

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);

  const categoryId = searchParams.get('categoryId')
    ? parseInt(searchParams.get('categoryId')!)
    : undefined;
  const search = searchParams.get('search') ?? undefined;

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.getAll({ page, limit: 12, categoryId, search })
      .then((r) => {
        setProducts(r.data.data);
        setTotal(r.data.meta?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page, categoryId, search]);

  const totalPages = Math.ceil(total / 12);

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

      {/* Filtros */}
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
          {categories.map((cat) => (
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
          <p className="text-dark-400 font-medium">No se encontraron productos</p>
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
                  <p className="text-dark-400 text-xs line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
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

      {/* Paginación */}
      {totalPages > 1 && (
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