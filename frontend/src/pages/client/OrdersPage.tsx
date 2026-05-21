import { useEffect, useState } from 'react';
import { Package, RefreshCw, X } from 'lucide-react';
import { orderApi } from '../../services/api';
import type { Order } from '../../types';

const STEPS = [
  { key: 'PENDING',   label: 'Pendiente',  desc: 'Pedido recibido'       },
  { key: 'CONFIRMED', label: 'Confirmado', desc: 'Pedido confirmado'      },
  { key: 'PREPARING', label: 'Preparando', desc: 'En cocina'              },
  { key: 'READY',     label: 'Listo',      desc: 'Listo para entregar'    },
  { key: 'DELIVERED', label: 'Entregado',  desc: '¡Pedido entregado!'     },
];

const getStepIndex = (status: string) =>
  STEPS.findIndex((s) => s.key === status);

function OrderTracker({ order, onCancel }: { order: Order; onCancel: (id: number) => void }) {
  const isCancelled = order.status === 'CANCELLED';
  const isPending   = order.status === 'PENDING';
  const isDelivered = order.status === 'DELIVERED';
  const currentStep = isCancelled ? -1 : getStepIndex(order.status);

  // Extraer info de entrega de las notas
  const isDelivery = order.notes?.includes('Entrega a domicilio');
  const deliveryAddress = order.notes?.split('Entrega a domicilio: ')[1]?.split(' | ')[0];

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-white">Pedido #{order.id}</p>
          <p className="text-sm text-dark-400">{order.restaurant.name}</p>
          <p className="text-xs text-dark-600 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('es-GT', { dateStyle: 'medium' })}
          </p>
          {/* Tipo de entrega */}
          <p className="text-xs text-dark-400 mt-1">
            {isDelivery
              ? `📍 Delivery: ${deliveryAddress}`
              : '🏪 Pickup en restaurante'
            }
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-brand-400 text-lg">
            Q{Number(order.total).toFixed(2)}
          </p>
          <p className="text-xs text-dark-500">
            {order.paymentMethod === 'CARD' ? '💳 Tarjeta' : '💵 Efectivo'}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      {!isCancelled ? (
        <div className="pt-2">
          <div className="relative flex items-center justify-between mb-4">
            {/* Línea fondo */}
            <div className="absolute left-0 right-0 h-0.5 bg-dark-700 top-4 z-0" />
            {/* Línea progreso */}
            <div className="absolute left-0 h-0.5 bg-brand-500 top-4 z-0 transition-all duration-700"
              style={{
                width: currentStep <= 0
                  ? '0%'
                  : `${(currentStep / (STEPS.length - 1)) * 100}%`,
              }} />

            {STEPS.map((step, i) => {
              const done   = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                                   text-xs font-bold transition-all duration-300 ${
                    done
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : active
                        ? 'bg-dark-800 border-brand-500 text-brand-400 shadow-glow'
                        : 'bg-dark-800 border-dark-600 text-dark-500'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    active ? 'text-brand-400' : done ? 'text-dark-300' : 'text-dark-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Estado actual */}
          <div className={`text-center py-2 rounded-xl text-sm font-medium ${
            isDelivered
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
          }`}>
            {STEPS[currentStep]?.desc ?? 'Procesando...'}
          </div>
        </div>
      ) : (
        <div className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20
                        text-red-400 text-sm font-medium text-center">
          ❌ Pedido cancelado
          {order.paymentMethod === 'CARD' && (
            <p className="text-xs text-red-400/60 mt-1">
              El reembolso se procesará en 3-5 días hábiles
            </p>
          )}
        </div>
      )}

      {/* Productos */}
      <div className="border-t border-dark-700 pt-4 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-dark-400">{item.quantity}x {item.product.name}</span>
            <span className="text-dark-300">Q{Number(item.totalPrice).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Botón cancelar — solo si está en Pendiente */}
      {isPending && (
        <div className="border-t border-dark-700 pt-4">
          <button
            onClick={() => onCancel(order.id)}
            className="flex items-center gap-2 text-sm font-medium text-red-400
                       hover:text-red-300 transition-colors">
            <X size={16} />
            Cancelar pedido
          </button>
          {order.paymentMethod === 'CARD' && (
            <p className="text-xs text-dark-600 mt-1 ml-6">
              El reembolso se procesará en 3-5 días hábiles
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [_cancelling, setCancelling] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const r = await orderApi.getMine();
      setOrders(r.data.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id: number) => {
    setShowConfirm(id);
  };

  const confirmCancel = async () => {
    if (!showConfirm) return;
    setCancelling(showConfirm);
    setShowConfirm(null);
    try {
      await orderApi.updateStatus(showConfirm, 'CANCELLED');
      await load(true);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="text-center py-20 text-dark-500">Cargando pedidos...</div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Historial
          </p>
          <h1 className="font-display text-4xl text-white tracking-wide">MIS PEDIDOS</h1>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 btn-secondary text-sm">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-dark-600 mb-4" />
          <p className="text-dark-400 font-medium">No tienes pedidos aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderTracker
              key={order.id}
              order={order}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-dark-600">
        Se actualiza automáticamente cada 30 segundos
      </p>

      {/* Modal confirmación cancelar */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setShowConfirm(null)} />
          <div className="relative bg-dark-800 border border-dark-700 rounded-2xl
                          w-full max-w-sm p-6 animate-slide-up text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="font-display text-xl text-white tracking-wide mb-2">
              ¿CANCELAR PEDIDO?
            </h3>
            <p className="text-dark-400 text-sm mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar el pedido #{showConfirm}?
            </p>
            {orders.find(o => o.id === showConfirm)?.paymentMethod === 'CARD' && (
              <p className="text-xs text-dark-500 mb-4 bg-dark-700 rounded-xl p-3">
                💳 El reembolso se procesará en 3-5 días hábiles
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="btn-secondary flex-1">
                No, mantener
              </button>
              <button onClick={confirmCancel}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold
                           px-6 py-2.5 rounded-xl transition-colors">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}