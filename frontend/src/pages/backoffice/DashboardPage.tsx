import { useEffect, useState } from 'react';
import { ShoppingBag, Package, Tag, Users } from 'lucide-react';
import { orderApi, productApi, offerApi, userApi } from '../../services/api';

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY:     'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'badge-yellow',
  CONFIRMED: 'badge-blue',
  PREPARING: 'badge-red',
  READY:     'badge-green',
  DELIVERED: 'badge-gray',
  CANCELLED: 'badge-gray',
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ orders: 0, products: 0, offers: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      orderApi.getAll({ page: 1 }),
      productApi.getAll({ page: 1, limit: 1 }),
      offerApi.getAll(),
      userApi.getAll(),
    ]).then(([orders, products, offers, users]) => {
      setStats({
        orders:   orders.data.meta?.total ?? 0,
        products: products.data.meta?.total ?? 0,
        offers:   offers.data.data.length,
        users:    users.data.data.length,
      });
      setRecentOrders(orders.data.data.slice(0, 5));
    });
  }, []);

  const cards = [
    { label: 'Pedidos totales',   value: stats.orders,   icon: ShoppingBag, color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20'    },
    { label: 'Productos activos', value: stats.products, icon: Package,     color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
    { label: 'Ofertas vigentes',  value: stats.offers,   icon: Tag,         color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20'   },
    { label: 'Usuarios',          value: stats.users,    icon: Users,       color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
  ];

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">
          Panel
        </p>
        <h1 className="font-display text-3xl text-white tracking-wide">DASHBOARD</h1>
        <p className="text-dark-400 mt-1">Resumen de operaciones FastBites</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-dark-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos recientes */}
      <div className="card">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="font-semibold text-white">Pedidos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-700">
              <tr>
                {['#', 'Cliente', 'Restaurante', 'Total', 'Pago', 'Estado', 'Fecha'].map((h) => (
                  <th key={h}
                    className="text-left px-6 py-3 text-xs font-semibold
                               text-dark-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-500">
                    No hay pedidos aún
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">#{o.id}</td>
                    <td className="px-6 py-4 text-dark-300">{o.user?.name}</td>
                    <td className="px-6 py-4 text-dark-300">{o.restaurant?.name}</td>
                    <td className="px-6 py-4 font-semibold text-brand-400">
                      Q{Number(o.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-dark-300">
                      {o.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={STATUS_COLORS[o.status] ?? 'badge-gray'}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString('es-GT')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}