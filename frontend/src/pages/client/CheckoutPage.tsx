import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, MapPin } from 'lucide-react';
import { orderApi, restaurantApi } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import type { Restaurant } from '../../types';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
    restaurantApi.getAll().then((r) => {
      setRestaurants(r.data.data);
      if (r.data.data[0]) setRestaurantId(r.data.data[0].id);
    });
  }, []);

  const handleSubmit = async () => {
    if (!restaurantId) { setError('Selecciona un restaurante'); return; }
    setLoading(true);
    setError('');
    try {
      await orderApi.create({
        restaurantId,
        paymentMethod,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          sizeId: i.sizeId,
          drinkId: i.drinkId,
          addonIds: i.addonIds,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-gray-900">Checkout</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Restaurant selection */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-brand-500" />
          <h2 className="font-semibold text-gray-900">Restaurante</h2>
        </div>
        <select
          value={restaurantId ?? ''}
          onChange={(e) => setRestaurantId(Number(e.target.value))}
          className="input"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name} — {r.address}</option>
          ))}
        </select>
      </div>

      {/* Payment method */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Método de pago</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'CASH', label: 'Efectivo contra entrega', icon: Banknote },
            { value: 'CARD', label: 'Pago con tarjeta', icon: CreditCard },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setPaymentMethod(value)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${
                paymentMethod === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-200'
              }`}
            >
              <Icon size={24} className={paymentMethod === value ? 'text-brand-500' : 'text-gray-400'} />
              <span className="text-sm font-medium text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.quantity}x {item.product.name}</span>
              <span className="font-medium">Q{(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="text-brand-600">Q{total().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notas del pedido (opcional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales..." className="input resize-none h-20" />
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full text-base py-3">
        {loading ? 'Procesando...' : `Confirmar pedido — Q${total().toFixed(2)}`}
      </button>
    </div>
  );
}
