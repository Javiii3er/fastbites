import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { productApi } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import type { Product } from '../../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>();
  const [selectedDrinkId, setSelectedDrinkId] = useState<number | undefined>();
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    productApi.getById(Number(id)).then((r) => {
      setProduct(r.data.data);
      if (r.data.data.sizes?.[0]) setSelectedSizeId(r.data.data.sizes[0].id);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando...</div>;
  if (!product) return <div className="text-center py-20 text-gray-400">Producto no encontrado</div>;

  const sizeExtra = product.sizes.find((s) => s.id === selectedSizeId)?.extraPrice ?? 0;
  const drinkExtra = product.drinks.find((d) => d.id === selectedDrinkId)?.price ?? 0;
  const addonsTotal = selectedAddonIds.reduce((acc, aid) => {
    const a = product.addons.find((a) => a.id === aid);
    return acc + (a ? Number(a.price) : 0);
  }, 0);
  const unitPrice = Number(product.basePrice) + Number(sizeExtra) + Number(drinkExtra) + addonsTotal;

  const handleAddToCart = () => {
    addItem({
      product,
      sizeId: selectedSizeId,
      drinkId: selectedDrinkId,
      addonIds: selectedAddonIds,
      quantity,
      notes: notes || undefined,
      unitPrice,
    });
    navigate('/cart');
  };

  const toggleAddon = (id: number) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="h-64 bg-gradient-to-br from-orange-100 to-brand-100 flex items-center justify-center text-8xl">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : <span>{product.category?.dayPart === 'LUNCH' ? '🍔' : '🍕'}</span>
          }
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs text-brand-500 font-semibold">{product.category?.name}</p>
            <h1 className="font-display text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
            {product.description && <p className="text-gray-500 mt-2">{product.description}</p>}
          </div>

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tamaño</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSizeId(s.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedSizeId === s.id
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    {s.name} {Number(s.extraPrice) > 0 && `+Q${Number(s.extraPrice).toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {product.addons.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ingredientes adicionales</h3>
              <div className="space-y-2">
                {product.addons.map((a) => (
                  <label key={a.id} className="flex items-center justify-between p-3 rounded-xl border
                                               border-gray-200 hover:border-brand-300 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddonIds.includes(a.id)}
                        onChange={() => toggleAddon(a.id)}
                        className="w-4 h-4 accent-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{a.name}</span>
                    </div>
                    {Number(a.price) > 0 && (
                      <span className="text-sm text-brand-600 font-semibold">+Q{Number(a.price).toFixed(2)}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Drinks */}
          {product.drinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Bebida</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDrinkId(undefined)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    !selectedDrinkId ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  Sin bebida
                </button>
                {product.drinks.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDrinkId(d.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedDrinkId === d.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    {d.name} {Number(d.price) > 0 && `+Q${Number(d.price).toFixed(2)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Notas (opcional)</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sin cebolla, extra salsa..."
              className="input resize-none h-20"
            />
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-gray-600 hover:text-brand-500 transition-colors">
                <Minus size={18} />
              </button>
              <span className="font-bold text-gray-900 w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="text-gray-600 hover:text-brand-500 transition-colors">
                <Plus size={18} />
              </button>
            </div>

            <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              Agregar — Q{(unitPrice * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
