// BOOffersPage
import { useEffect, useState } from 'react';
import { offerApi } from '../../services/api';
export function BOOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const load = () => offerApi.getAll().then((r) => setOffers(r.data.data));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Administrar Ofertas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {offers.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">-{o.discount}%</span>
                <h3 className="font-bold text-gray-900 mt-2">{o.title}</h3>
                {o.code && <p className="text-xs font-mono text-brand-600 mt-1">{o.code}</p>}
              </div>
              <button onClick={async () => { await offerApi.toggle(o.id); load(); }}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${o.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {o.isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default BOOffersPage;
