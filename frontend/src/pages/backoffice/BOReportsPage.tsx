import { useEffect, useState } from 'react';
import { reportApi } from '../../services/api';

const DAYPART_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Desayuno',
  LUNCH:     '☀️ Almuerzo',
  DINNER:    '🌙 Cena',
};

export default function BOReportsPage() {
  const [byDay, setByDay] = useState<any[]>([]);
  const [byDayPart, setByDayPart] = useState<any[]>([]);
  const [byHour, setByHour] = useState<any[]>([]);

  useEffect(() => {
    reportApi.salesByDay().then((r) => setByDay(r.data.data));
    reportApi.salesByDayPart().then((r) => setByDayPart(r.data.data));
    reportApi.salesByHour().then((r) => setByHour(r.data.data));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-1">
          Backoffice
        </p>
        <h1 className="font-display text-3xl text-white tracking-wide">REPORTERÍA</h1>
      </div>

      {/* Ventas por Daypart */}
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

      {/* Ventas por día */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="font-semibold text-white">Ventas por día (últimos 30 días)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-700">
              <tr>
                {['Fecha', 'Pedidos', 'Ingresos'].map((h) => (
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
                  <td colSpan={3} className="text-center py-10 text-dark-500">
                    Sin datos aún
                  </td>
                </tr>
              ) : (
                byDay.slice(0, 15).map((d: any, i) => (
                  <tr key={i} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-3 text-dark-300">
                      {String(d.date)?.split('T')[0]}
                    </td>
                    <td className="px-6 py-3 font-medium text-white">{d.orders}</td>
                    <td className="px-6 py-3 font-bold text-brand-400">
                      Q{Number(d.revenue ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventas por hora */}
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
              ) : (
                byHour.map((d: any) => (
                  <tr key={d.hour} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-3 text-dark-300">
                      {String(d.hour).padStart(2, '0')}:00
                    </td>
                    <td className="px-6 py-3 font-medium text-white">{d.orders}</td>
                    <td className="px-6 py-3 font-bold text-brand-400">
                      Q{Number(d.revenue ?? 0).toFixed(2)}
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