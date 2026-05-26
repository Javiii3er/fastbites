import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { categoryApi, offerApi } from '../../services/api';
import type { Category, Offer } from '../../types';

const getCategoryEmoji = (name: string) => {
  switch (name) {
    case 'Hamburguesas':   return '🍔';
    case 'Pizzas':         return '🍕';
    case 'Desayunos':      return '🥐';
    case 'Pollo':          return '🍗';
    case 'Tacos y Wraps':  return '🌮';
    case 'Papas y Snacks': return '🍟';
    case 'Ensaladas':      return '🥗';
    case 'Hot Dogs':       return '🌭';
    case 'Postres':        return '🍰';
    case 'Bebidas':        return '🥤';
    default:               return '🍽️';
  }
};

const getCategoryColor = (name: string) => {
  switch (name) {
    case 'Hamburguesas':   return 'from-orange-500/20 to-transparent';
    case 'Pizzas':         return 'from-red-500/20 to-transparent';
    case 'Desayunos':      return 'from-yellow-500/20 to-transparent';
    case 'Pollo':          return 'from-amber-500/20 to-transparent';
    case 'Tacos y Wraps':  return 'from-green-500/20 to-transparent';
    case 'Papas y Snacks': return 'from-yellow-600/20 to-transparent';
    case 'Ensaladas':      return 'from-emerald-500/20 to-transparent';
    case 'Hot Dogs':       return 'from-red-600/20 to-transparent';
    case 'Postres':        return 'from-pink-500/20 to-transparent';
    case 'Bebidas':        return 'from-blue-500/20 to-transparent';
    default:               return 'from-brand-500/20 to-transparent';
  }
};

export default function HomePage() {
  const [categories, setCategories]     = useState<Category[]>([]);
  const [offers, setOffers]             = useState<Offer[]>([]);
  const [loadingCats, setLoadingCats]   = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    categoryApi.getAll()
      .then((r) => setCategories(r.data.data))
      .finally(() => setLoadingCats(false));
    offerApi.getAll()
      .then((r) => setOffers(r.data.data))
      .finally(() => setLoadingOffers(false));
  }, []);

  return (
    <div className="space-y-20 animate-slide-up">

      {/* Hero */}
      <section className="relative min-h-[520px] flex items-center rounded-3xl overflow-hidden
                          bg-dark-800 border border-dark-700">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent
                        to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full
                        blur-3xl pointer-events-none" />

        <div className="relative z-10 px-8 md:px-16 py-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20
                          rounded-full px-4 py-1.5 text-brand-400 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Pedidos en menos de 30 minutos
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-white leading-none tracking-wide">
            COMIDA<br />
            <span className="text-brand-500">RÁPIDA,</span><br />
            A TU MANERA
          </h1>

          <p className="mt-6 text-dark-300 text-lg leading-relaxed">
            Hamburguesas y pizzas artesanales. Pedí en segundos, recibí en minutos.
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            <Link to="/products"
              className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Ver menú completo <ArrowRight size={18} />
            </Link>
            {offers.length > 0 && (
              <Link to="/offers"
                className="btn-secondary flex items-center gap-2 text-base px-8 py-3">
                Ver ofertas
              </Link>
            )}
          </div>
        </div>

        <div className="absolute right-8 bottom-8 hidden lg:flex gap-4 opacity-10">
          {['🍔', '🍕', '🌮', '🍟'].map((e, i) => (
            <span key={i} className="text-7xl"
              style={{ transform: `rotate(${(i - 1.5) * 8}deg)` }}>
              {e}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Zap,         title: 'Pedido rápido', desc: 'En menos de 3 clics ya tienes tu pedido confirmado.'  },
          { icon: Clock,       title: 'Seguimiento',   desc: 'Monitorea el estado de tu pedido en tiempo real.'     },
          { icon: ShieldCheck, title: 'Pago seguro',   desc: 'Acepta tarjeta o efectivo contra entrega.'            },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title}
            className="card p-6 flex gap-4 items-start group
                       hover:border-brand-500/30 hover:bg-dark-700 transition-all duration-300">
            <div className="bg-brand-500/10 border border-brand-500/20 text-brand-500
                            p-3 rounded-xl shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{title}</h3>
              <p className="text-dark-400 text-sm mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categorías */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Categorías
            </p>
            <h2 className="font-display text-4xl text-white tracking-wide">EXPLORA EL MENÚ</h2>
          </div>
          {!loadingCats && categories.length > 0 && (
            <Link to="/products"
              className="hidden sm:flex items-center gap-1.5 text-dark-400
                         hover:text-white text-sm font-medium transition-colors">
              Ver todo <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Skeleton de categorías */}
        {loadingCats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-36 bg-dark-700 rounded-t-2xl" />
                <div className="p-3">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`}
                className="card-hover group cursor-pointer">
                <div className={`h-36 flex items-center justify-center relative overflow-hidden
                                 bg-gradient-to-br ${getCategoryColor(cat.name)}`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300
                                   drop-shadow-lg">
                    {getCategoryEmoji(cat.name)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-800/60 to-transparent" />
                </div>
                <div className="p-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm group-hover:text-brand-400
                                 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <ArrowRight size={14}
                    className="text-dark-500 group-hover:text-brand-500
                               group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Ofertas */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Promociones
            </p>
            <h2 className="font-display text-4xl text-white tracking-wide">OFERTAS ACTIVAS</h2>
          </div>
          {!loadingOffers && offers.length > 0 && (
            <Link to="/offers"
              className="hidden sm:flex items-center gap-1.5 text-dark-400
                         hover:text-white text-sm font-medium transition-colors">
              Ver todas <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Skeleton de ofertas */}
        {loadingOffers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse space-y-3">
                <div className="h-6 bg-dark-700 rounded w-20" />
                <div className="h-8 bg-dark-700 rounded w-2/3" />
                <div className="h-4 bg-dark-700 rounded w-full" />
                <div className="h-4 bg-dark-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-10 text-dark-500">
            No hay ofertas activas en este momento
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {offers.slice(0, 2).map((offer) => (
              <div key={offer.id}
                className="card p-6 border-brand-500/20 bg-gradient-to-br
                           from-brand-500/5 to-transparent
                           hover:from-brand-500/10 transition-all cursor-pointer">
                <span className="badge-red font-bold text-sm px-3 py-1.5 mb-4 inline-block">
                  -{offer.discount}% OFF
                </span>
                <h3 className="font-display text-2xl text-white tracking-wide">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-dark-400 mt-2 text-sm">{offer.description}</p>
                )}
                {offer.code && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-dark-500">Código:</span>
                    <span className="font-mono font-bold text-brand-400 bg-brand-500/10
                                     border border-brand-500/20 px-3 py-1 rounded-lg tracking-wider">
                      {offer.code}
                    </span>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-dark-500">
                  <span>Válido hasta:</span>
                  <span>
                    {new Date(offer.endsAt).toLocaleDateString('es-GT', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="card p-10 text-center bg-gradient-to-br
                          from-brand-500/10 via-transparent to-transparent
                          border-brand-500/20">
        <h2 className="font-display text-4xl text-white tracking-wide mb-3">
          ¿LISTO PARA PEDIR?
        </h2>
        <p className="text-dark-400 mb-6">
          Explora nuestro catálogo completo con 32 productos de 10 categorías
        </p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
          Ver menú completo <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  );
}