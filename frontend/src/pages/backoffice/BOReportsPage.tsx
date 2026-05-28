import { useEffect, useState } from 'react';
import { reportApi } from '../../services/api';

const DAYPART_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Desayuno',
  LUNCH:     '☀️ Almuerzo',
  DINNER:    '🌙 Cena',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  READY:     'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-yellow-500/10 text-yellow-400',
  CONFIRMED: 'bg-purple-500/10 text-purple-400',
  PREPARING: 'bg-blue-500/10 text-blue-400',
  READY:     'bg-brand-500/10 text-brand-400',
  DELIVERED: 'bg-green-500/10 text-green-400',
  CANCELLED: 'bg-dark-700 text-dark-400',
};

export default function BOReportsPage() {
  const [byDay, setByDay]             = useState<any[]>([]);
  const [byDayPart, setByDayPart]     = useState<any[]>([]);
  const [byHour, setByHour]           = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [summary, setSummary]         = useState<any>(null);

  useEffect(() => {
    reportApi.salesByDay().then((r)     => setByDay(r.data.data));
    reportApi.salesByDayPart().then((r) => setByDayPart(r.data.data));
    reportApi.salesByHour().then((r)    => setByHour(r.data.data));
    reportApi.topProducts().then((r)    => setTopProducts(r.data.data));
    reportApi.summary().then((r)        => setSummary(r.data.data));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">
          Backoffice
        </p>
        <h1 className="font-display text-3xl text-white tracking-wide">REPORTERÍA</h1>
      </div>

      {/* ─── Resumen General ─────────────────────────────────── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 text-center">
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-2">
              Ingresos del mes
            </p>
            <p className="text-2xl font-bold text-brand-400">
              Q{summary.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {summary.totalOrders} pedidos
            </p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-2">
              Pedido promedio
            </p>
            <p className="text-2xl font-bold text-white">
              Q{summary.avgOrder.toFixed(2)}
            </p>
            <p className="text-xs text-dark-500 mt-1">por pedido</p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-2">
              Cliente frecuente
            </p>
            <p className="text-lg font-bold text-white truncate">
              {summary.topClient}
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {summary.topClientOrders} pedidos
            </p>
          </div>
          <div className="card p-5 text-center">
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-2">
              Producto estrella
            </p>
            <p className="text-lg font-bold text-white truncate">
              {summary.topProduct}
            </p>
            <p className="text-xs text-dark-500 mt-1">
              {summary.topProductSold} vendidos
            </p>
          </div>
        </div>
      )}

      {/* ─── Ventas por Daypart ───────────────────────────────── */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4">Ventas por horario</h2>
        {byDayPart.length === 0 ? (
          <p className="text-dark-500 text-sm">Sin datos aún</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {byDayPart.map((d: any) => (
              <div key={d.dayPart}
                className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
                <p className="text-lg">{DAYPART_LABELS[d.dayPart] ?? d.dayPart}</p>
                <p className="text-2xl font-bold text-brand-400 mt-2">
                  Q{Number(d.revenue ?? 0).toFixed(2)}
                </p>
                <p className="text-sm text-dark-400 mt-1">{d.orders} pedidos</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Top 5 Productos ─────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="font-semibold text-white">🏆 Top 5 productos más vendidos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-700">
              <tr>
                {['#', 'Producto', 'Categoría', 'Unidades vendidas', 'Ingresos'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                                         text-dark-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-dark-500">
                    Sin datos aún
                  </td>
                </tr>
              ) : topProducts.map((p: any, i) => (
                <tr key={i} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-3">
                    <span className={`font-bold text-lg ${
                      i === 0 ? 'text-yellow-400' :
                      i === 1 ? 'text-gray-300'   :
                      i === 2 ? 'text-amber-600'  : 'text-dark-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-white">{p.product}</td>
                  <td className="px-6 py-3 text-dark-400">{p.category}</td>
                  <td className="px-6 py-3 font-semibold text-white">
                    {p.totalSold} uds.
                  </td>
                  <td className="px-6 py-3 font-bold text-brand-400">
                    Q{Number(p.totalRevenue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Ventas por día con detalle ───────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="font-semibold text-white">Ventas por día (últimos 30 días)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-700">
              <tr>
                {['Fecha / Pedido', 'Cliente', 'Ingresos', 'Pago', 'Estado'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                                         text-dark-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {byDay.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-dark-500">
                    Sin datos aún
                  </td>
                </tr>
              ) : byDay.slice(0, 15).map((d: any, i) => (
                <>
                  {/* Fila resumen del día */}
                  <tr key={`day-${i}`}
                    className="bg-dark-700/50">
                    <td className="px-6 py-3 font-bold text-white" colSpan={2}>
                      📅 {new Date(d.date).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-3 font-bold text-brand-400">
                      Q{Number(d.revenue ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-dark-400 text-xs">
                      {d.orders} pedido{d.orders !== 1 ? 's' : ''}
                    </td>
                    <td />
                  </tr>
                  {/* Filas de detalle por pedido */}
                  {d.detail?.map((order: any) => (
                    <tr key={`order-${order.orderId}`}
                      className="hover:bg-dark-700/30 transition-colors">
                      <td className="px-6 py-2 text-dark-400 text-xs pl-10">
                        └ Pedido #{order.orderId}
                      </td>
                      <td className="px-6 py-2 text-dark-300 text-xs">
                        {order.client}
                      </td>
                      <td className="px-6 py-2 text-brand-400 text-xs font-semibold">
                        Q{Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-2 text-xs text-dark-400">
                        {order.payment === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                      </td>
                      <td className="px-6 py-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                         ${STATUS_COLORS[order.status] ?? 'bg-dark-700 text-dark-400'}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Ventas por hora ─────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="font-semibold text-white">Ventas por hora del día</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-700">
              <tr>
                {['Hora', 'Pedidos', 'Ingresos'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold
                                         text-dark-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {byHour.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-dark-500">
                    Sin datos aún
                  </td>
                </tr>
              ) : byHour.map((d: any) => (
                <tr key={d.hour} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-3 text-dark-300">
                    {String(d.hour).padStart(2, '0')}:00
                  </td>
                  <td className="px-6 py-3 font-medium text-white">{d.orders}</td>
                  <td className="px-6 py-3 font-bold text-brand-400">
                    Q{Number(d.revenue ?? 0).toFixed(2)}
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