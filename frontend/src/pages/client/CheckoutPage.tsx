import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, MapPin, Store, Plus } from 'lucide-react';
import { orderApi, restaurantApi, offerApi, userApi } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import type { Restaurant, Address } from '../../types';

type DeliveryType = 'PICKUP' | 'DELIVERY';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();

  const [restaurants, setRestaurants]       = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId]     = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod]   = useState<'CARD' | 'CASH'>('CASH');
  const [deliveryType, setDeliveryType]     = useState<DeliveryType>('PICKUP');
  const [addresses, setAddresses]           = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress]         = useState('');
  const [useNewAddress, setUseNewAddress]   = useState(false);
  const [notes, setNotes]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  // ─── Cupón ───────────────────────────────────────────────
  const [couponCode, setCouponCode]         = useState('');
  const [appliedOffer, setAppliedOffer]     = useState<any | null>(null);
  const [couponError, setCouponError]       = useState('');
  const [couponLoading, setCouponLoading]   = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
    restaurantApi.getAll().then((r) => {
      setRestaurants(r.data.data);
      if (r.data.data[0]) setRestaurantId(r.data.data[0].id);
    });
    userApi.getAddresses().then((r) => {
      setAddresses(r.data.data);
      const def = r.data.data.find((a: Address) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    });
  }, []);

  // ─── Aplicar cupón ───────────────────────────────────────
  const applyCode = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setAppliedOffer(null);
    try {
      const res   = await offerApi.getAll();
      const offer = res.data.data.find(
        (o: any) => o.code?.toUpperCase() === couponCode.toUpperCase()
      );
      if (!offer) { setCouponError('Código no válido o expirado'); return; }

      const now  = new Date();
      const hour = now.getHours();
      const day  = now.getDay();
      const code = couponCode.toUpperCase();

      if (code === 'MARTES2X1') {
        if (day !== 2) { setCouponError('Este cupón solo es válido los martes'); return; }
      }
      if (code === 'DESAYUNO15') {
        if (hour < 6 || hour >= 10) {
          setCouponError('Este cupón solo es válido de 6:00am a 10:00am'); return;
        }
      }
      if (code === 'FAMILIA25') {
        if (total() < 200) {
          setCouponError('Este cupón requiere un pedido mínimo de Q200'); return;
        }
      }
      if (code === 'ALITAS30') {
        const hasAlitas = items.some((i) =>
          i.product.name.toLowerCase().includes('alita')
        );
        if (!hasAlitas) {
          setCouponError('Este cupón solo aplica en pedidos que incluyan alitas'); return;
        }
      }
      setAppliedOffer(offer);
    } catch {
      setCouponError('Error al verificar el código');
    } finally {
      setCouponLoading(false);
    }
  };

  // ─── Totales ─────────────────────────────────────────────
  const discount   = appliedOffer ? total() * appliedOffer.discount / 100 : 0;
  const finalTotal = total() - discount;

  // ─── Dirección seleccionada ──────────────────────────────
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const deliveryText = useNewAddress
    ? newAddress
    : selectedAddress
      ? `${selectedAddress.alias}: ${selectedAddress.street}, ${selectedAddress.city}`
      : '';

  // ─── Confirmar pedido ────────────────────────────────────
  const handleSubmit = async () => {
    // ─── Validación Daypart ──────────────────────────────
    const hour = new Date().getHours();
    const dayPartNow = 
      hour >= 6  && hour < 11 ? 'BREAKFAST' : 
      hour >= 11 && hour < 16 ? 'LUNCH'     : 'DINNER';

    const dayPartLabels: Record<string, string> = {
      BREAKFAST: 'Desayunos (6:00am - 11:00am)',
      LUNCH:     'Almuerzos (11:00am - 4:00pm)',
      DINNER:    'Cenas (4:00pm - 10:00pm)',
    };

    const invalidItem = items.find((i) => {
      const dp = i.product.category?.dayPart;
      return dp && dp !== dayPartNow;
    });

    if (invalidItem) {
      setError(
        `"${invalidItem.product.name}" solo está disponible en ${
          dayPartLabels[invalidItem.product.category?.dayPart ?? '']
        }. Ahora solo puedes pedir ${dayPartLabels[dayPartNow]}.`
      );
      return;
    }

    if (!restaurantId) { setError('Selecciona un restaurante'); return; }
    if (deliveryType === 'DELIVERY' && !deliveryText.trim()) {
      setError('Selecciona o ingresa una dirección de entrega'); return;
    }
    setLoading(true);
    setError('');
    try {
      const notesText = [
        deliveryType === 'DELIVERY'
          ? `📍 Entrega a domicilio: ${deliveryText}`
          : '🏪 Pickup en restaurante',
        notes,
      ].filter(Boolean).join(' | ');

      await orderApi.create({
        restaurantId,
        paymentMethod,
        notes:     notesText || undefined,
        offerId:   appliedOffer?.id || undefined,
        addressId: deliveryType === 'DELIVERY' && !useNewAddress
          ? selectedAddressId ?? undefined
          : undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          sizeId:    i.sizeId,
          drinkId:   i.drinkId,
          addonIds:  i.addonIds,
          quantity:  i.quantity,
          notes:     i.notes,
        })),
      });
      clearCart();
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
          Pago
        </p>
        <h1 className="font-display text-4xl text-white tracking-wide">CHECKOUT</h1>
      </div>

      {error && (
  <div className="bg-brand-500/10 border border-brand-500/30
                  text-brand-400 text-sm rounded-xl px-4 py-3">
    <p>{error}</p>
     {error.includes('disponible en') && (
        <button
        onClick={() => navigate('/cart')}
        className="mt-2 text-xs font-semibold text-white underline hover:text-brand-300
                   transition-colors">
        ← Volver al carrito para modificar tu pedido
        </button>
        )}
      </div>
      )}  

      {/* Tipo de entrega */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4">Tipo de entrega</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'PICKUP',   label: 'Recoger en restaurante', icon: Store  },
            { value: 'DELIVERY', label: 'Entrega a domicilio',    icon: MapPin },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setDeliveryType(value)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                deliveryType === value
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-600 hover:border-dark-500'
              }`}>
              <Icon size={24}
                className={deliveryType === value ? 'text-brand-400' : 'text-dark-400'} />
              <span className={`text-sm font-medium text-center ${
                deliveryType === value ? 'text-white' : 'text-dark-400'
              }`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Dirección si es delivery */}
        {deliveryType === 'DELIVERY' && (
          <div className="mt-4 space-y-3">
            {/* Direcciones guardadas */}
            {addresses.length > 0 && !useNewAddress && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">
                  Direcciones guardadas
                </p>
                {addresses.map((addr) => (
                  <label key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer
                                transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-dark-600 hover:border-dark-500'
                    }`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{addr.alias}</p>
                      <p className="text-xs text-dark-400">{addr.street}</p>
                      <p className="text-xs text-dark-500">{addr.city}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Usar nueva dirección */}
          {!useNewAddress && addresses.length === 0 ? (
          // Si no hay direcciones guardadas, mostrar campo directo
          <div className="space-y-2">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">
              Dirección de entrega
          </p>
            <input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Ej: 6a Avenida 3-12, Zona 1, Ciudad de Guatemala"
          className="input"
            />
          <p className="text-xs text-dark-500">
          Guarda tus direcciones en{' '}
          <a href="/profile" className="text-brand-400 hover:underline">Mi Perfil</a>{' '}
              para usarlas más rápido la próxima vez.
          </p>
          </div>
          ) : !useNewAddress ? (
        <button
            onClick={() => setUseNewAddress(true)}
            className="flex items-center gap-2 text-sm text-brand-400
               hover:text-brand-300 transition-colors font-medium">
          <Plus size={16} />
            Usar otra dirección
        </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-dark-400 uppercase tracking-wide">
                    Nueva dirección
                  </p>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setUseNewAddress(false)}
                      className="text-xs text-dark-400 hover:text-white transition-colors">
                      Usar guardada
                    </button>
                  )}
                </div>
                <input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ej: 6a Avenida 3-12, Zona 1, Ciudad de Guatemala"
                  className="input"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Restaurante */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Store size={16} className="text-brand-500" />
          <h2 className="font-semibold text-white">
            {deliveryType === 'PICKUP' ? 'Restaurante donde recoger' : 'Restaurante más cercano'}
          </h2>
        </div>
        <select
          value={restaurantId ?? ''}
          onChange={(e) => setRestaurantId(Number(e.target.value))}
          className="input">
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name} — {r.address}</option>
          ))}
        </select>
      </div>

      {/* Método de pago */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4">Método de pago</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'CASH', label: 'Efectivo contra entrega', icon: Banknote   },
            { value: 'CARD', label: 'Pago con tarjeta',        icon: CreditCard },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setPaymentMethod(value)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === value
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-600 hover:border-dark-500'
              }`}>
              <Icon size={24}
                className={paymentMethod === value ? 'text-brand-400' : 'text-dark-400'} />
              <span className={`text-sm font-medium text-center ${
                paymentMethod === value ? 'text-white' : 'text-dark-400'
              }`}>{label}</span>
            </button>
          ))}
        </div>
        {paymentMethod === 'CARD' && (
          <p className="mt-3 text-xs text-dark-500">
            💳 En caso de cancelación, el reembolso se procesará en 3-5 días hábiles.
          </p>
        )}
      </div>

      {/* Código de descuento */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4">Código de descuento</h2>
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponError('');
              setAppliedOffer(null);
            }}
            placeholder="Ej: MARTES2X1"
            className="input flex-1 font-mono tracking-wider"
          />
          <button onClick={applyCode}
            disabled={couponLoading || !couponCode.trim()}
            className="btn-primary px-5">
            {couponLoading ? '...' : 'Aplicar'}
          </button>
        </div>
        {couponError && (
          <p className="text-red-400 text-xs mt-2">{couponError}</p>
        )}
        {appliedOffer && (
          <div className="mt-3 flex items-center justify-between bg-green-500/10
                          border border-green-500/20 rounded-xl px-4 py-2.5">
            <div>
              <p className="text-green-400 text-sm font-semibold">
                ✅ {appliedOffer.title}
              </p>
              <p className="text-xs text-green-500/70">
                -{appliedOffer.discount}% de descuento aplicado
              </p>
            </div>
            <button
              onClick={() => { setAppliedOffer(null); setCouponCode(''); }}
              className="text-xs text-green-500/50 hover:text-green-400 transition-colors">
              Quitar
            </button>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-4">Resumen del pedido</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-dark-400">{item.quantity}x {item.product.name}</span>
              <span className="font-medium text-white">
                Q{(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {appliedOffer && (
            <div className="flex justify-between text-sm text-green-400 pt-1">
              <span>Descuento ({appliedOffer.discount}%)</span>
              <span>-Q{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-dark-700 pt-3 mt-3 flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-brand-400">Q{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Info entrega */}
        <div className="mt-4 pt-4 border-t border-dark-700 flex items-start gap-2 text-xs text-dark-400">
          {deliveryType === 'PICKUP'
            ? <><Store size={13} className="shrink-0 mt-0.5" /> Recoge en el restaurante seleccionado</>
            : <><MapPin size={13} className="shrink-0 mt-0.5 text-brand-500" />
                {deliveryText || 'Selecciona una dirección'}
              </>
          }
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-1.5">
          Notas del pedido (opcional)
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales..."
          className="input resize-none h-20" />
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="btn-primary w-full text-base py-3">
        {loading ? 'Procesando...' : `Confirmar pedido — Q${finalTotal.toFixed(2)}`}
      </button>
    </div>
  );
}