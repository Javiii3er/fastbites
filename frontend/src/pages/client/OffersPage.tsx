import { useEffect, useState } from 'react';
import { offerApi } from '../../services/api';
import type { Offer } from '../../types';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerApi.getAll().then((r) => setOffers(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Promociones
        </p>
        <h1 className="font-display text-4xl text-white tracking-wide">MIS OFERTAS</h1>
        <p className="text-dark-400 mt-1">Descuentos disponibles para ti</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 text-dark-500">
          <p className="text-5xl mb-4">🏷️</p>
          <p className="font-medium">No hay ofertas activas en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {offers.map((offer) => (
            <div key={offer.id}
              className="card p-6 border-brand-500/20 bg-gradient-to-br
                         from-brand-500/5 to-transparent hover:from-brand-500/10 transition-all">
              <span className="badge-red font-bold text-sm px-3 py-1.5 mb-4 inline-block">
                -{offer.discount}% OFF
              </span>
              <h3 className="font-display text-2xl text-white tracking-wide">{offer.title}</h3>
              {offer.description && (
                <p className="text-dark-400 mt-2 text-sm">{offer.description}</p>
              )}
              {offer.code && (
                <div className="mt-4 p-3 bg-dark-900 rounded-xl border border-dark-600">
                  <p className="text-xs text-dark-500 mb-1">Código de descuento</p>
                  <p className="font-mono font-bold text-brand-400 text-xl tracking-widest">
                    {offer.code}
                  </p>
                </div>
              )}
              <p className="text-xs text-dark-600 mt-4">
                Válido hasta: {new Date(offer.endsAt).toLocaleDateString('es-GT', { dateStyle: 'long' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}