import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="text-center py-20 space-y-4">
      <ShoppingBag size={48} className="mx-auto text-dark-600" />
      <p className="text-dark-400 font-medium">Tu carrito está vacío</p>
      <Link to="/products" className="btn-primary inline-block">Ver menú</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Compra
        </p>
        <h1 className="font-display text-4xl text-white tracking-wide">TU CARRITO</h1>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="card p-4 flex items-center gap-4">
            <div className="text-3xl w-12 text-center">
              {item.product.category?.dayPart === 'LUNCH' ? '🍔'
                : item.product.category?.dayPart === 'DINNER' ? '🍕' : '🥐'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{item.product.name}</p>
              <p className="text-sm text-dark-400">Q{item.unitPrice.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(i, Math.max(1, item.quantity - 1))}
                className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600
                           flex items-center justify-center text-sm font-bold text-white transition-colors">
                -
              </button>
              <span className="w-6 text-center font-bold text-sm text-white">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(i, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600
                           flex items-center justify-center text-sm font-bold text-white transition-colors">
                +
              </button>
            </div>
            <p className="font-bold text-brand-400 w-20 text-right">
              Q{(item.unitPrice * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => removeItem(i)}
              className="text-dark-500 hover:text-brand-400 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center text-lg font-bold">
          <span className="text-white">Total</span>
          <span className="text-brand-400">Q{total().toFixed(2)}</span>
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