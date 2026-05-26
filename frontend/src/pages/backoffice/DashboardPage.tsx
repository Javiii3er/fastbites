import { useEffect, useState } from 'react';
import { ShoppingBag, Package, Tag, Users, TrendingUp } from 'lucide-react';
import { orderApi, productApi, offerApi, userApi, reportApi } from '../../services/api';

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

const DAYPART_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Desayuno',
  LUNCH:     '☀️ Almuerzo',
  DINNER:    '🌙 Cena',
};

const DAYPART_COLORS: Record<string, string> = {
  BREAKFAST: 'bg-yellow-500',
  LUNCH:     'bg-brand-500',
  DINNER:    'bg-blue-500',
};

export default function DashboardPage() {
  const [stats, setStats]           = useState({ orders: 0, products: 0, offers: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [byDay, setByDay]           = useState<any[]>([]);
  const [byDayPart, setByDayPart]   = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      orderApi.getAll({ page: 1 }),
      productApi.getAll({ page: 1, limit: 1 }),
      offerApi.getAll(),
      userApi.getAll(),
      reportApi.salesByDay(),
      reportApi.salesByDayPart(),
    ]).then(([orders, products, offers, users, day, daypart]) => {
      setStats({
        orders:   orders.data.meta?.total ?? 0,
        products: products.data.meta?.total ?? 0,
        offers:   offers.data.data.length,
        users:    users.data.data.length,
      });
      setRecentOrders(orders.data.data.slice(0, 5));
      setByDay(day.data.data.slice(0, 7).reverse());
      setByDayPart(daypart.data.data);
    });
  }, []);

  const cards = [
    { label: 'Pedidos totales',   value: stats.orders,   icon: ShoppingBag, color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20'    },
    { label: 'Productos activos', value: stats.products, icon: Package,     color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/20' },
    { label: 'Ofertas vigentes',  value: stats.offers,   icon: Tag,         color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20'   },
    { label: 'Usuarios',          value: stats.users,    icon: Users,       color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
  ];

  // Calcular el máximo para la gráfica de barras
  const maxRevenue = Math.max(...byDay.map((d) => Number(d.revenue ?? 0)), 1);

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

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gráfica de barras — ventas últimos 7 días */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-brand-500" />
            <h2 className="font-semibold text-white">Ventas últimos 7 días</h2>
          </div>
          {byDay.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-dark-500 text-sm">
              Sin datos aún — realiza pedidos para ver la gráfica
            </div>
          ) : (
            <div className="space-y-3">
              {byDay.map((d, i) => {
                const revenue  = Number(d.revenue ?? 0);
                const pct      = (revenue / maxRevenue) * 100;
                const fecha    = String(d.date)?.split('T')[0];
                const [, mes, dia] = fecha.split('-');
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-dark-500 text-xs w-12 shrink-0 text-right">
                      {dia}/{mes}
                    </span>
                    <div className="flex-1 bg-dark-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-400
                                   rounded-full flex items-center justify-end pr-2
                                   transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}>
                        {pct > 20 && (
                          <span className="text-white text-xs font-semibold">
                            Q{revenue.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {pct <= 20 && (
                      <span className="text-dark-400 text-xs w-16 shrink-0">
                        Q{revenue.toFixed(0)}
                      </span>
                    )}
                    <span className="text-dark-500 text-xs w-12 shrink-0 text-right">
                      {d.orders} ped.
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ventas por Daypart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-6">Ventas por horario</h2>
          {byDayPart.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-dark-500 text-sm text-center">
              Sin datos aún
            </div>
          ) : (
            <div className="space-y-4">
              {byDayPart.map((d: any) => {
                const total    = byDayPart.reduce((acc, x) => acc + Number(x.revenue ?? 0), 0);
                const revenue  = Number(d.revenue ?? 0);
                const pct      = total > 0 ? (revenue / total) * 100 : 0;
                return (
                  <div key={d.dayPart} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-dark-300">
                        {DAYPART_LABELS[d.dayPart] ?? d.dayPart}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        Q{revenue.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500
                                    ${DAYPART_COLORS[d.dayPart] ?? 'bg-brand-500'}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-500">
                      {d.orders} pedido{d.orders !== 1 ? 's' : ''} — {pct.toFixed(1)}%
                    </p>
                  </div>
                );
              })}

              {/* Total */}
              <div className="pt-3 border-t border-dark-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark-400">Total</span>
                  <span className="text-sm font-bold text-brand-400">
                    Q{byDayPart.reduce((acc, d) => acc + Number(d.revenue ?? 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
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
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold
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
              ) : recentOrders.map((o) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}