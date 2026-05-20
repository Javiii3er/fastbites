import { useEffect, useState } from 'react';
import { ShoppingBag, Package, Tag, Users } from 'lucide-react';
import { orderApi, productApi, offerApi, userApi } from '../../services/api';

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
        orders: orders.data.meta?.total ?? 0,
        products: products.data.meta?.total ?? 0,
        offers: offers.data.data.length,
        users: users.data.data.length,
      });
      setRecentOrders(orders.data.data.slice(0, 5));
    });
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-orange-100 text-orange-700',
    READY: 'bg-green-100 text-green-700',
    DELIVERED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const cards = [
    { label: 'Pedidos totales', value: stats.orders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Productos activos', value: stats.products, icon: Package, color: 'bg-orange-50 text-orange-600' },
    { label: 'Ofertas vigentes', value: stats.offers, icon: Tag, color: 'bg-green-50 text-green-600' },
    { label: 'Usuarios', value: stats.users, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de operaciones FastBites</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Cliente', 'Restaurante', 'Total', 'Pago', 'Estado', 'Fecha'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">#{o.id}</td>
                  <td className="px-6 py-4 text-gray-600">{o.user?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{o.restaurant?.name}</td>
                  <td className="px-6 py-4 font-semibold text-brand-600">Q{Number(o.total).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{o.paymentMethod === 'CARD' ? '💳' : '💵'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString('es-GT')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
