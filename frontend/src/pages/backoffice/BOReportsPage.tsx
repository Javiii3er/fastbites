import { useEffect, useState } from 'react';
import { reportApi } from '../../services/api';

export default function BOReportsPage() {
  const [byDay, setByDay] = useState<any[]>([]);
  const [byDayPart, setByDayPart] = useState<any[]>([]);
  const [byHour, setByHour] = useState<any[]>([]);

  useEffect(() => {
    reportApi.salesByDay().then((r) => setByDay(r.data.data));
    reportApi.salesByDayPart().then((r) => setByDayPart(r.data.data));
    reportApi.salesByHour().then((r) => setByHour(r.data.data));
  }, []);

  const DAYPART_LABELS: Record<string, string> = { BREAKFAST: '🌅 Desayuno', LUNCH: '☀️ Almuerzo', DINNER: '🌙 Cena' };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-gray-900">Reportería</h1>

      {/* Ventas por Daypart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ventas por horario (Daypart)</h2>
        <div className="grid grid-cols-3 gap-4">
          {byDayPart.map((d: any) => (
            <div key={d.dayPart} className="bg-brand-50 rounded-xl p-4 text-center">
              <p className="text-lg">{DAYPART_LABELS[d.dayPart] ?? d.dayPart}</p>
              <p className="text-2xl font-bold text-brand-600 mt-2">Q{Number(d.revenue ?? 0).toFixed(2)}</p>
              <p className="text-sm text-gray-500">{d.orders} pedidos</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ventas por día */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ventas por día (últimos 30 días)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {['Fecha','Pedidos','Ingresos'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {byDay.slice(0, 15).map((d: any, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{String(d.date)?.split('T')[0]}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{d.orders}</td>
                  <td className="px-6 py-3 font-bold text-brand-600">Q{Number(d.revenue ?? 0).toFixed(2)}</td>
                </tr>
              ))}
              {byDay.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Sin datos aún</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventas por hora */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Ventas por hora del día</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              {['Hora','Pedidos','Ingresos'].map((h) => (
                <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {byHour.map((d: any) => (
                <tr key={d.hour} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{String(d.hour).padStart(2,'0')}:00</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{d.orders}</td>
                  <td className="px-6 py-3 font-bold text-brand-600">Q{Number(d.revenue ?? 0).toFixed(2)}</td>
                </tr>
              ))}
              {byHour.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Sin datos aún</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
