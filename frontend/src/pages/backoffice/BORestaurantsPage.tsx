import { useEffect, useState } from 'react';
import { restaurantApi } from '../../services/api';
export default function BORestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  useEffect(() => { restaurantApi.getAll().then((r) => setRestaurants(r.data.data)); }, []);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Administrar Restaurantes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {restaurants.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900">{r.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{r.address}</p>
            {r.phone && <p className="text-xs text-gray-400 mt-1">{r.phone}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {r.dayParts?.map((dp: any) => (
                <span key={dp.dayPart} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                  {dp.dayPart} {dp.startTime}–{dp.endTime}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
