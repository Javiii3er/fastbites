import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Clock, ShieldCheck } from 'lucide-react';
import { categoryApi, offerApi } from '../../services/api';
import type { Category, Offer } from '../../types';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data.data));
    offerApi.getAll().then((r) => setOffers(r.data.data));
  }, []);

  const dayPartLabel: Record<string, string> = {
    BREAKFAST: '🌅 Desayunos',
    LUNCH: '☀️ Almuerzos',
    DINNER: '🌙 Cenas',
  };

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl
                          overflow-hidden text-white px-8 py-16 md:py-20">
        <div className="relative z-10 max-w-lg">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
            Comida rápida,<br />a tu manera 🍔
          </h1>
          <p className="mt-4 text-brand-100 text-lg">
            Hamburguesas y pizzas artesanales. Pedí en segundos, recibí en minutos.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/products" className="bg-white text-brand-600 font-bold px-6 py-3 rounded-xl
                                            hover:bg-brand-50 transition-colors flex items-center gap-2">
              Ver menú <ChevronRight size={18} />
            </Link>
            {offers.length > 0 && (
              <Link to="/offers" className="border-2 border-white/40 text-white font-bold px-6 py-3
                                            rounded-xl hover:bg-white/10 transition-colors">
                Ver ofertas
              </Link>
            )}
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full" />
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Zap,         title: 'Pedido rápido',     desc: 'En menos de 3 clics ya tienes tu pedido confirmado.' },
          { icon: Clock,       title: 'Seguimiento',        desc: 'Monitorea el estado de tu pedido en tiempo real.' },
          { icon: ShieldCheck, title: 'Pago seguro',        desc: 'Acepta tarjeta o efectivo contra entrega.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 flex gap-4 items-start">
            <div className="bg-brand-50 text-brand-500 p-3 rounded-xl shrink-0">
              <Icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Explora el menú</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="card group hover:shadow-md transition-shadow"
              >
                <div className="h-36 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center
                                justify-center text-4xl">
                  {cat.dayPart === 'BREAKFAST' ? '🥐' : cat.dayPart === 'LUNCH' ? '🍔' : '🍕'}
                </div>
                <div className="p-4">
                  <p className="text-xs text-brand-500 font-semibold">{dayPartLabel[cat.dayPart]}</p>
                  <h3 className="font-bold text-gray-900 mt-0.5 group-hover:text-brand-500 transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Offers preview */}
      {offers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-gray-900">Ofertas activas</h2>
            <Link to="/offers" className="text-brand-500 text-sm font-semibold hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {offers.slice(0, 2).map((offer) => (
              <div key={offer.id} className="card p-6 bg-gradient-to-br from-orange-50 to-brand-50
                                             border border-brand-100">
                <span className="inline-block bg-brand-500 text-white text-xs font-bold px-3 py-1
                                 rounded-full mb-3">
                  -{offer.discount}% OFF
                </span>
                <h3 className="font-bold text-gray-900 text-lg">{offer.title}</h3>
                {offer.description && <p className="text-sm text-gray-500 mt-1">{offer.description}</p>}
                {offer.code && (
                  <p className="mt-3 text-xs text-gray-500">
                    Código: <span className="font-mono font-bold text-brand-600 bg-brand-50
                                             px-2 py-0.5 rounded">{offer.code}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
