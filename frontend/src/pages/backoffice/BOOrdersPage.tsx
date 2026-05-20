// BOOrdersPage.tsx
import { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';

const STATUSES = ['PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
  PREPARING:'bg-orange-100 text-orange-700', READY:'bg-green-100 text-green-700',
  DELIVERED:'bg-gray-100 text-gray-600', CANCELLED:'bg-red-100 text-red-700',
};

export function BOOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Consultar Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${!filter ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          Todos
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['#','Cliente','Total','Pago','Estado','Acción','Fecha'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">Cargando...</td></tr>
              : orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-600">{o.user?.name}</td>
                    <td className="px-4 py-3 font-semibold text-brand-600">Q{Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3">{o.paymentMethod === 'CARD' ? '💳' : '💵'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select onChange={(e) => changeStatus(o.id, e.target.value)} defaultValue={o.status}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString('es-GT')}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default BOOrdersPage;
