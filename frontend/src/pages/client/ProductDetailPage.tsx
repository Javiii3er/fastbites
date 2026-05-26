import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, LogIn } from 'lucide-react';
import { productApi } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import type { Product } from '../../types';

const getCategoryEmoji = (name?: string) => {
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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct]                   = useState<Product | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [selectedSizeId, setSelectedSizeId]     = useState<number | undefined>();
  const [selectedDrinkId, setSelectedDrinkId]   = useState<number | undefined>();
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [quantity, setQuantity]                 = useState(1);
  const [notes, setNotes]                       = useState('');

  useEffect(() => {
    productApi.getById(Number(id)).then((r) => {
      setProduct(r.data.data);
      if (r.data.data.sizes?.[0]) setSelectedSizeId(r.data.data.sizes[0].id);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="text-center py-20 text-dark-500">Cargando...</div>
  );
  if (!product) return (
    <div className="text-center py-20 text-dark-500">Producto no encontrado</div>
  );

  const sizeExtra   = product.sizes.find((s) => s.id === selectedSizeId)?.extraPrice ?? 0;
  const drinkExtra  = product.drinks.find((d) => d.id === selectedDrinkId)?.price ?? 0;
  const addonsTotal = selectedAddonIds.reduce((acc, aid) => {
    const a = product.addons.find((a) => a.id === aid);
    return acc + (a ? Number(a.price) : 0);
  }, 0);
  const unitPrice = Number(product.basePrice) + Number(sizeExtra) + Number(drinkExtra) + addonsTotal;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem({
      product, sizeId: selectedSizeId, drinkId: selectedDrinkId,
      addonIds: selectedAddonIds, quantity, notes: notes || undefined, unitPrice,
    });
    navigate('/cart');
  };

  const toggleAddon = (id: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-slide-up">
      {/* Botón volver */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-white
                   transition-colors text-sm font-medium group">
        <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
        Volver al menú
      </button>

      <div className="card">
        {/* Imagen */}
        <div className="h-64 bg-dark-700 flex items-center justify-center
                        text-8xl overflow-hidden relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
          ) : (
            <span>{getCategoryEmoji(product.category?.name)}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent
                          pointer-events-none" />
        </div>

        <div className="p-6 space-y-6">
          {/* Info básica */}
          <div>
            <p className="text-brand-500 text-xs font-semibold uppercase tracking-widest">
              {product.category?.name}
            </p>
            <h1 className="font-display text-3xl text-white tracking-wide mt-1">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-dark-400 mt-2">{product.description}</p>
            )}
            <p className="text-2xl font-bold text-brand-400 mt-3">
              Q{Number(product.basePrice).toFixed(2)}
            </p>
          </div>

          {/* Tamaños */}
          {product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Tamaño</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSizeId(s.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedSizeId === s.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                        : 'bg-dark-700 text-dark-200 border-dark-600 hover:border-dark-500'
                    }`}>
                    {s.name}{' '}
                    {Number(s.extraPrice) > 0 && `+Q${Number(s.extraPrice).toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {product.addons.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Ingredientes adicionales</h3>
              <div className="space-y-2">
                {product.addons.map((a) => (
                  <label key={a.id}
                    className="flex items-center justify-between p-3 rounded-xl border
                               border-dark-600 hover:border-brand-500/40 cursor-pointer
                               transition-all">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedAddonIds.includes(a.id)}
                        onChange={() => toggleAddon(a.id)}
                        className="w-4 h-4 accent-brand-500" />
                      <span className="text-sm font-medium text-white">{a.name}</span>
                    </div>
                    {Number(a.price) > 0 && (
                      <span className="text-sm text-brand-400 font-semibold">
                        +Q{Number(a.price).toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Bebidas */}
          {product.drinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3">Bebida</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedDrinkId(undefined)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    !selectedDrinkId
                      ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                      : 'bg-dark-700 text-dark-200 border-dark-600 hover:border-dark-500'
                  }`}>
                  Sin bebida
                </button>
                {product.drinks.map((d) => (
                  <button key={d.id} onClick={() => setSelectedDrinkId(d.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selectedDrinkId === d.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                        : 'bg-dark-700 text-dark-200 border-dark-600 hover:border-dark-500'
                    }`}>
                    {d.name}{' '}
                    {Number(d.price) > 0 && `+Q${Number(d.price).toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <h3 className="font-semibold text-white mb-2">Notas (opcional)</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Sin cebolla, extra salsa..."
              className="input resize-none h-20" />
          </div>

          {/* Cantidad + botón */}
          <div className="flex items-center gap-4 pt-2">
            {/* Contador — solo visible si está logueado */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 bg-dark-700 rounded-xl px-4 py-2.5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-dark-300 hover:text-white transition-colors">
                  <Minus size={18} />
                </button>
                <span className="font-bold text-white w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="text-dark-300 hover:text-white transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            )}

            {/* Botón principal */}
            <button onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3
                          font-semibold rounded-xl transition-all text-sm ${
                isAuthenticated
                  ? 'btn-primary'
                  : 'bg-dark-700 border border-brand-500/40 text-brand-400 hover:bg-brand-500 hover:text-white'
              }`}>
              {isAuthenticated ? (
                <>
                  <ShoppingCart size={18} />
                  Agregar — Q{(unitPrice * quantity).toFixed(2)}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Inicia sesión para pedir
                </>
              )}
            </button>
          </div>

          {/* Mensaje informativo si no está logueado */}
          {!isAuthenticated && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl px-4 py-3
                            flex items-center justify-between">
              <p className="text-dark-400 text-sm">
                ¿Ya tienes cuenta?
              </p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300
                             transition-colors">
                  Ingresar
                </button>
                <span className="text-dark-600">·</span>
                <button onClick={() => navigate('/register')}
                  className="text-sm font-semibold text-white hover:text-brand-400
                             transition-colors">
                  Registrarse
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}