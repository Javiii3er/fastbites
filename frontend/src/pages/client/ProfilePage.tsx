import { useEffect, useState } from 'react';
import { MapPin, Plus, X, Star, Trash2, CreditCard } from 'lucide-react';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import type { User, Address } from '../../types';

interface PaymentMethod {
  id: number;
  alias: string;
  lastFour: string;
  brand: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { setAuth, token } = useAuthStore();
  const [user, setUser]             = useState<User | null>(null);
  const [addresses, setAddresses]   = useState<Address[]>([]);
  const [payments, setPayments]     = useState<PaymentMethod[]>([]);
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState('');

  // ─── Dirección ────────────────────────────────────────────
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrAlias, setAddrAlias]   = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity]     = useState('');
  const [addrError, setAddrError]   = useState('');
  const [addrSaving, setAddrSaving] = useState(false);
  const [deletingAddrId, setDeletingAddrId] = useState<number | null>(null);

  // ─── Método de pago ───────────────────────────────────────
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAlias, setPayAlias]       = useState('');
  const [payLastFour, setPayLastFour] = useState('');
  const [payBrand, setPayBrand]       = useState('Visa');
  const [payError, setPayError]       = useState('');
  const [paySaving, setPaySaving]     = useState(false);
  const [deletingPayId, setDeletingPayId] = useState<number | null>(null);

  const loadAddresses = () =>
    userApi.getAddresses().then((r) => setAddresses(r.data.data));

  const loadPayments = () =>
    userApi.getPaymentMethods().then((r) => setPayments(r.data.data));

  useEffect(() => {
    userApi.getProfile().then((r) => {
      setUser(r.data.data);
      setName(r.data.data.name);
      setPhone(r.data.data.phone ?? '');
    });
    loadAddresses();
    loadPayments();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ name, phone });
      setUser(res.data.data);
      if (token) setAuth(res.data.data, token);
      setEditing(false);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addrAlias || !addrStreet || !addrCity) {
      setAddrError('Todos los campos son requeridos');
      return;
    }
    setAddrSaving(true);
    setAddrError('');
    try {
      await userApi.addAddress({
        alias: addrAlias, street: addrStreet, city: addrCity,
        latitude: 14.6407, longitude: -90.5133,
        isDefault: addresses.length === 0,
      });
      setAddrAlias(''); setAddrStreet(''); setAddrCity('');
      setShowAddressForm(false);
      loadAddresses();
      setSuccess('Dirección guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setAddrError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    setDeletingAddrId(id);
    try {
      await userApi.deleteAddress(id);
      loadAddresses();
      setSuccess('Dirección eliminada');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setDeletingAddrId(null);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await userApi.setDefaultAddress(id);
      loadAddresses();
      setSuccess('Dirección principal actualizada');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
  };

  const handleSavePayment = async () => {
    if (!payAlias || !payLastFour || !payBrand) {
      setPayError('Todos los campos son requeridos');
      return;
    }
    if (payLastFour.length !== 4 || !/^\d+$/.test(payLastFour)) {
      setPayError('Los últimos 4 dígitos deben ser exactamente 4 números');
      return;
    }
    setPaySaving(true);
    setPayError('');
    try {
      await userApi.addPaymentMethod({ alias: payAlias, lastFour: payLastFour, brand: payBrand });
      setPayAlias(''); setPayLastFour(''); setPayBrand('Visa');
      setShowPaymentForm(false);
      loadPayments();
      setSuccess('Método de pago agregado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setPayError(err.response?.data?.message ?? 'Error al guardar');
    } finally {
      setPaySaving(false);
    }
  };

  const handleDeletePayment = async (id: number) => {
    setDeletingPayId(id);
    try {
      await userApi.deletePaymentMethod(id);
      loadPayments();
      setSuccess('Método de pago eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setDeletingPayId(null);
    }
  };

  const handleSetDefaultPayment = async (id: number) => {
    try {
      await userApi.setDefaultPayment(id);
      loadPayments();
      setSuccess('Método de pago principal actualizado');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
  };

  const formatPhone = (p: string) => {
    if (!p) return '—';
    const clean = p.replace('+502', '').replace(/\s/g, '');
    return `+502 ${clean}`;
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':       return '💳';
      case 'mastercard': return '💳';
      case 'amex':       return '💳';
      default:           return '💳';
    }
  };

  if (!user) return (
    <div className="text-center py-20 text-dark-500">Cargando perfil...</div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-slide-up">
      <div>
        <button onClick={() => window.history.back()}
          className="flex items-center gap-2 text-dark-400 hover:text-white
                     transition-colors text-sm font-medium group mb-4">
          <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
          Volver
        </button>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Cuenta
        </p>
        <h1 className="font-display text-4xl text-white tracking-wide">MI PERFIL</h1>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400
                        text-sm rounded-xl px-4 py-3">
          ✅ {success}
        </div>
      )}

      {/* ─── Datos personales ─────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-500/15 border border-brand-500/20
                          rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-400 font-display">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-bold text-white text-lg">{user.name}</p>
            <p className="text-sm text-dark-400">{user.email}</p>
            <span className="badge-red mt-1 inline-block">{user.role}</span>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Teléfono</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-dark-700 border border-dark-600
                                rounded-xl text-dark-300 text-sm font-medium shrink-0">
                  +502
                </div>
                <input
                  value={phone.replace('+502', '').replace(/\s/g, '')}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="input flex-1" placeholder="12345678" maxLength={8}
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">Solo los 8 dígitos de tu número</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm border-b border-dark-700 pb-3">
              <span className="text-dark-400">Email</span>
              <span className="font-medium text-white">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-dark-700 pb-3">
              <span className="text-dark-400">Teléfono</span>
              <span className="font-medium text-white">{formatPhone(user.phone ?? '')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Rol</span>
              <span className="font-medium text-white">
                {user.role === 'CLIENT' ? 'Cliente'
                  : user.role === 'ADMIN' ? 'Administrador' : 'Manager'}
              </span>
            </div>
            <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-2">
              Editar perfil
            </button>
          </div>
        )}
      </div>

      {/* ─── Métodos de pago ──────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <CreditCard size={18} className="text-brand-500" />
            Métodos de pago
          </h2>
          <button
            onClick={() => { setShowPaymentForm(!showPaymentForm); setPayError(''); }}
            className="flex items-center gap-1.5 text-sm text-brand-400
                       hover:text-brand-300 transition-colors font-medium">
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {/* Formulario nuevo método de pago */}
        {showPaymentForm && (
          <div className="bg-dark-700 rounded-xl p-4 space-y-3 border border-dark-600">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Nueva tarjeta</p>
              <button onClick={() => setShowPaymentForm(false)}
                className="text-dark-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {payError && <p className="text-red-400 text-xs">{payError}</p>}
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">
                Alias (Ej: Mi Visa, Tarjeta trabajo)
              </label>
              <input value={payAlias} onChange={(e) => setPayAlias(e.target.value)}
                placeholder="Mi Visa" className="input text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1">
                  Últimos 4 dígitos
                </label>
                <input value={payLastFour}
                  onChange={(e) => setPayLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234" className="input text-sm" maxLength={4} />
              </div>
              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1">
                  Marca
                </label>
                <select value={payBrand} onChange={(e) => setPayBrand(e.target.value)}
                  className="input text-sm">
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowPaymentForm(false)}
                className="btn-secondary flex-1 text-sm py-2">Cancelar</button>
              <button onClick={handleSavePayment} disabled={paySaving}
                className="btn-primary flex-1 text-sm py-2">
                {paySaving ? 'Guardando...' : 'Guardar tarjeta'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de métodos de pago */}
        {payments.length === 0 && !showPaymentForm ? (
          <p className="text-dark-500 text-sm text-center py-4">
            No tienes métodos de pago guardados
          </p>
        ) : (
          <div className="space-y-2">
            {payments.map((pm) => (
              <div key={pm.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-dark-700 border border-dark-600">
                <span className="text-xl shrink-0 mt-0.5">{getBrandIcon(pm.brand)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{pm.alias}</p>
                    {pm.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star size={10} fill="currentColor" />
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {pm.brand} •••• {pm.lastFour}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {!pm.isDefault && (
                      <button onClick={() => handleSetDefaultPayment(pm.id)}
                        className="flex items-center gap-1 text-xs text-amber-400
                                   hover:text-amber-300 transition-colors">
                        <Star size={11} />
                        Marcar como principal
                      </button>
                    )}
                    <button onClick={() => handleDeletePayment(pm.id)}
                      disabled={deletingPayId === pm.id}
                      className="flex items-center gap-1 text-xs text-red-400
                                 hover:text-red-300 transition-colors">
                      <Trash2 size={11} />
                      {deletingPayId === pm.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Mis direcciones ──────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <MapPin size={18} className="text-brand-500" />
            Mis direcciones
          </h2>
          <button
            onClick={() => { setShowAddressForm(!showAddressForm); setAddrError(''); }}
            className="flex items-center gap-1.5 text-sm text-brand-400
                       hover:text-brand-300 transition-colors font-medium">
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {showAddressForm && (
          <div className="bg-dark-700 rounded-xl p-4 space-y-3 border border-dark-600">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Nueva dirección</p>
              <button onClick={() => setShowAddressForm(false)}
                className="text-dark-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            {addrError && <p className="text-red-400 text-xs">{addrError}</p>}
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">
                Alias (Ej: Casa, Trabajo)
              </label>
              <input value={addrAlias} onChange={(e) => setAddrAlias(e.target.value)}
                placeholder="Casa" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Dirección</label>
              <input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)}
                placeholder="6a Avenida 3-12, Zona 1" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Ciudad / Municipio</label>
              <input value={addrCity} onChange={(e) => setAddrCity(e.target.value)}
                placeholder="Ciudad de Guatemala" className="input text-sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAddressForm(false)}
                className="btn-secondary flex-1 text-sm py-2">Cancelar</button>
              <button onClick={handleSaveAddress} disabled={addrSaving}
                className="btn-primary flex-1 text-sm py-2">
                {addrSaving ? 'Guardando...' : 'Guardar dirección'}
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showAddressForm ? (
          <p className="text-dark-500 text-sm text-center py-4">
            No tienes direcciones guardadas
          </p>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <div key={addr.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-dark-700 border border-dark-600">
                <MapPin size={16} className="text-brand-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{addr.alias}</p>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star size={10} fill="currentColor" />
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5 truncate">{addr.street}</p>
                  <p className="text-xs text-dark-500">{addr.city}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(addr.id)}
                        className="flex items-center gap-1 text-xs text-amber-400
                                   hover:text-amber-300 transition-colors">
                        <Star size={11} />
                        Marcar como principal
                      </button>
                    )}
                    <button onClick={() => handleDeleteAddress(addr.id)}
                      disabled={deletingAddrId === addr.id}
                      className="flex items-center gap-1 text-xs text-red-400
                                 hover:text-red-300 transition-colors">
                      <Trash2 size={11} />
                      {deletingAddrId === addr.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}