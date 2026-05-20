import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import type { Product, Category } from '../../types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;
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
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Nuestro Menú</h1>
        <p className="text-gray-500 mt-1">Explora todos nuestros productos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            defaultValue={search}
            className="input pl-9"
            onChange={(e) => {
              setPage(1);
              const p = new URLSearchParams(searchParams);
              if (e.target.value) p.set('search', e.target.value);
              else p.delete('search');
              setSearchParams(p);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPage(1); setSearchParams({}); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              !categoryId ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setPage(1); setSearchParams({ categoryId: String(cat.id) }); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                categoryId === cat.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card group hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-brand-100 flex items-center
                              justify-center text-6xl overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{p.category?.dayPart === 'LUNCH' ? '🍔' : '🍕'}</span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-brand-500 font-semibold">{p.category?.name}</p>
                <h3 className="font-bold text-gray-900 mt-0.5 group-hover:text-brand-500 transition-colors line-clamp-1">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-brand-600 font-bold text-lg">
                    Q{Number(p.basePrice).toFixed(2)}
                  </span>
                  <span className="text-xs bg-brand-50 text-brand-600 px-3 py-1 rounded-full font-medium">
                    Ver más
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
