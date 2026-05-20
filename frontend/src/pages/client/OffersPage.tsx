// OffersPage.tsx
import { useEffect, useState } from 'react';
import { offerApi } from '../../services/api';
import type { Offer } from '../../types';

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerApi.getAll().then((r) => setOffers(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-gray-900">Mis Ofertas</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No hay ofertas activas en este momento</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <div key={offer.id} className="card p-6 bg-gradient-to-br from-orange-50 to-brand-50 border border-brand-100">
              <span className="inline-block bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                -{offer.discount}% OFF
              </span>
              <h3 className="font-bold text-gray-900 text-xl">{offer.title}</h3>
              {offer.description && <p className="text-gray-500 mt-2 text-sm">{offer.description}</p>}
              {offer.code && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-brand-200">
                  <p className="text-xs text-gray-500 mb-1">Código de descuento</p>
                  <p className="font-mono font-bold text-brand-600 text-lg tracking-wider">{offer.code}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Válido hasta: {new Date(offer.endsAt).toLocaleDateString('es-GT', { dateStyle: 'medium' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
