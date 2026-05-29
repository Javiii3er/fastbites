import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { orderApi } from '../../services/api';

const STATUSES = [
  { value: 'PENDING',   label: 'Pendiente'  },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'READY',     label: 'Listo'      },
  { value: 'DELIVERED', label: 'Entregado'  },
  { value: 'CANCELLED', label: 'Cancelado'  },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'badge-yellow',
  CONFIRMED: 'badge-blue',
  PREPARING: 'badge-red',
  READY:     'badge-green',
  DELIVERED: 'badge-gray',
  CANCELLED: 'badge-gray',
};

export default function BOOrdersPage() {
  const [orders, setOrders]               = useState<any[]>([]);
  const [filter, setFilter]               = useState('');
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    orderApi.getAll({ status: filter || undefined })
      .then((r) => setOrders(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (id: number, status: string) => {
    await orderApi.updateStatus(id, status);
    load();
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev: any) => ({ ...prev, status }));
    }
  };

  const getDeliveryInfo = (notes?: string) => {
    if (!notes) return { type: 'Pickup', address: null };
    if (notes.includes('Entrega a domicilio')) {
      const address = notes.split('Entrega a domicilio: ')[1]?.split(' | ')[0];
      return { type: 'Delivery', address };
    }
    return { type: 'Pickup', address: null };
  };

  // Filtrar por búsqueda en el frontend
  const filteredOrders = orders.filter((o) => {
  if (!search.trim()) return true;
  const q = search.toLowerCase().replace('#', '');
  if (/^\d+$/.test(q)) {
    return String(o.id) === q;
  }
  return (
    o.user?.name?.toLowerCase().includes(q) ||
    o.user?.email?.toLowerCase().includes(q) ||
    o.restaurant?.name?.toLowerCase().includes(q)
  );
});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">
          Backoffice
        </p>
        <h1 className="font-display text-3xl text-white tracking-wide">CONSULTAR PEDIDOS</h1>
      </div>

      {/* Búsqueda + Filtros */}
      <div className="space-y-3">
        {/* Buscador */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por #, cliente, email o restaurante..."
            className="input pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500
                         hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              !filter
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-dark-800 border border-dark-600 text-dark-300 hover:text-white'
            }`}>
            Todos
          </button>
          {STATUSES.map((s) => (
            <button key={s.value} onClick={() => setFilter(s.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === s.value
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-dark-800 border border-dark-600 text-dark-300 hover:text-white'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Contador de resultados */}
        {search && (
          <p className="text-dark-500 text-xs">
            {filteredOrders.length} resultado{filteredOrders.length !== 1 ? 's' : ''} para "{search}"
          </p>
        )}
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-dark-700">
            <tr>
              {['#', 'Cliente', 'Restaurante', 'Total', 'Pago', 'Entrega', 'Estado', 'Cambiar estado', 'Fecha'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                       text-dark-400 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-dark-500">
                  Cargando pedidos...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-dark-500">
                  {search ? `No se encontraron pedidos para "${search}"` : 'No hay pedidos aún'}
                </td>
              </tr>
            ) : filteredOrders.map((o) => {
              const delivery = getDeliveryInfo(o.notes);
              const statusLabel = STATUSES.find(s => s.value === o.status)?.label ?? o.status;
              return (
                <tr key={o.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-4">
                    <button onClick={() => setSelectedOrder(o)}
                      className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                      #{o.id}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-dark-300">{o.user?.name}</td>
                  <td className="px-4 py-4 text-dark-400 text-xs">{o.restaurant?.name}</td>
                  <td className="px-4 py-4 font-semibold text-brand-400">
                    Q{Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-dark-300">
                    {o.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      delivery.type === 'Delivery'
                        ? 'bg-brand-500/10 text-brand-400'
                        : 'bg-dark-700 text-dark-400'
                    }`}>
                      {delivery.type === 'Delivery' ? '📍 Delivery' : '🏪 Pickup'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={STATUS_COLORS[o.status] ?? 'badge-gray'}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      defaultValue={o.status}
                      className="bg-dark-700 border border-dark-600 text-dark-200
                                 text-xs rounded-lg px-2 py-1.5 focus:outline-none
                                 focus:border-brand-500">
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-dark-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('es-GT')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal detalle del pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-dark-800 border border-dark-600 rounded-2xl
                          w-full max-w-lg shadow-card animate-slide-up
                          max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700
                            sticky top-0 bg-dark-800 z-10">
              <div>
                <h2 className="font-display text-xl text-white tracking-wide">
                  DETALLE PEDIDO #{selectedOrder.id}
                </h2>
                <p className="text-dark-400 text-xs mt-0.5">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('es-GT', { dateStyle: 'long' })}
                  {' '}—{' '}
                  {new Date(selectedOrder.createdAt).toLocaleTimeString('es-GT', { timeStyle: 'short' })}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}
                className="text-dark-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Estado actual */}
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Estado actual:</span>
                <div className="flex items-center gap-3">
                  <span className={STATUS_COLORS[selectedOrder.status] ?? 'badge-gray'}>
                    {STATUSES.find(s => s.value === selectedOrder.status)?.label}
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => changeStatus(selectedOrder.id, e.target.value)}
                    className="bg-dark-700 border border-dark-600 text-dark-200
                               text-xs rounded-lg px-2 py-1.5 focus:outline-none
                               focus:border-brand-500">
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Info cliente y entrega */}
              <div className="card p-4 space-y-3">
                <h3 className="font-semibold text-white text-sm">Información del pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Cliente:</span>
                    <span className="text-white font-medium">{selectedOrder.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Email:</span>
                    <span className="text-dark-300">{selectedOrder.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Restaurante:</span>
                    <span className="text-white">{selectedOrder.restaurant?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Método de pago:</span>
                    <span className="text-white">
                      {selectedOrder.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
                    </span>
                  </div>
                  {(() => {
                    const delivery = getDeliveryInfo(selectedOrder.notes);
                    return (
                      <div className="flex justify-between">
                        <span className="text-dark-400">Tipo de entrega:</span>
                        <span className="text-white">
                          {delivery.type === 'Delivery'
                            ? `📍 Delivery: ${delivery.address}`
                            : '🏪 Pickup en restaurante'}
                        </span>
                      </div>
                    );
                  })()}
                  {selectedOrder.notes?.includes('|') && (
                    <div className="flex justify-between">
                      <span className="text-dark-400">Notas:</span>
                      <span className="text-dark-300 text-right max-w-[200px]">
                        {selectedOrder.notes?.split(' | ').slice(1).join(' | ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700">
                  <h3 className="font-semibold text-white text-sm">Productos del pedido</h3>
                </div>
                <div className="divide-y divide-dark-700">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="px-4 py-3 flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {item.quantity}x {item.product?.name}
                        </p>
                        <p className="text-dark-500 text-xs">
                          Q{Number(item.unitPrice).toFixed(2)} c/u
                        </p>
                      </div>
                      <span className="text-brand-400 font-semibold text-sm">
                        Q{Number(item.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-400">Subtotal:</span>
                  <span className="text-white">Q{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Descuento:</span>
                    <span className="text-green-400">
                      -Q{Number(selectedOrder.discount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-dark-700 pt-2 mt-2">
                  <span className="text-white">Total:</span>
                  <span className="text-brand-400 text-lg">
                    Q{Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}