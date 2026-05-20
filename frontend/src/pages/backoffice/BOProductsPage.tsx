// BOProductsPage — stub funcional
import { useEffect, useState } from 'react';
import { productApi } from '../../services/api';
import type { Product } from '../../types';

export default function BOProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    productApi.getAll({ limit: 50 }).then((r) => setProducts(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Administrar Productos</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['ID','Nombre','Categoría','Precio base','Estado','Acción'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">Cargando...</td></tr>
              : products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">#{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">Q{Number(p.basePrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        (p as any).isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{(p as any).isActive ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={async () => { await productApi.toggle(p.id); load(); }}
                        className="text-xs font-medium text-brand-500 hover:underline">
                        {(p as any).isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
