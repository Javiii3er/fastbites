// OrdersPage.tsx
import { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import type { Order } from '../../types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado',  color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Preparando',  color: 'bg-orange-100 text-orange-700' },
  READY:     { label: 'Listo',       color: 'bg-green-100 text-green-700' },
  DELIVERED: { label: 'Entregado',   color: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMine().then((r) => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Cargando pedidos...</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-gray-900">Mis pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No tienes pedidos aún</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const s = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING;
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Pedido #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.restaurant.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-GT', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                </div>
                <div className="mt-4 space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600">
                      {item.quantity}x {item.product.name}
                    </p>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {order.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                  </span>
                  <span className="font-bold text-brand-600">Q{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
