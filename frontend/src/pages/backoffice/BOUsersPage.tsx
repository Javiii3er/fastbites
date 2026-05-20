import { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
export default function BOUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const load = () => userApi.getAll().then((r) => setUsers(r.data.data));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Administrar Usuarios</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>{['Nombre','Email','Rol','Estado','Acción'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{u.role}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                <td className="px-4 py-3"><button onClick={async () => { await userApi.toggle(u.id); load(); }} className="text-xs font-medium text-brand-500 hover:underline">{u.isActive ? 'Desactivar' : 'Activar'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
