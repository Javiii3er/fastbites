// ─── CartPage ─────────────────────────────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="text-center py-20 space-y-4">
      <ShoppingBag size={48} className="mx-auto text-gray-300" />
      <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
      <Link to="/products" className="btn-primary inline-block">Ver menú</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-gray-900">Tu carrito</h1>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="text-3xl w-12 text-center">
              {item.product.category?.dayPart === 'LUNCH' ? '🍔' : '🍕'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.product.name}</p>
              <p className="text-sm text-gray-500">Q{item.unitPrice.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(i, Math.max(1, item.quantity - 1))}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">-</button>
              <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(i, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">+</button>
            </div>
            <p className="font-bold text-brand-600 w-20 text-right">
              Q{(item.unitPrice * item.quantity).toFixed(2)}
            </p>
            <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
          <span>Total</span>
          <span className="text-brand-600">Q{total().toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={clearCart} className="btn-secondary flex-1">Vaciar carrito</button>
        <button onClick={() => navigate('/checkout')} className="btn-primary flex-1">
          Proceder al pago
        </button>
      </div>
    </div>
  );
}

export default CartPage;
