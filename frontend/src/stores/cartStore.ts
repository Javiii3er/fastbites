import { create } from 'zustand';
import api from '../services/http';
import type { CartItem } from '../types';


interface DBCartItem {
  id: number;
  userId: number;
  productId: number;
  sizeId: number | null;
  drinkId: number | null;
  quantity: number;
  unitPrice: number;
  notes: string | null;
  addonIds: number[];
  product: any; 
}

interface CartStore {
  items: DBCartItem[];
  restaurantId: number | null; 
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearCartLocal: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  loading: false,

  // ─── Cargar carrito desde BD ────────────────────────────────────────────────
  fetchCart: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/cart');
      
      const items = res.data.data.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        // Convierte el string de la BD "[1,2]" en un array real [1,2]
        addonIds: item.addonIds ? JSON.parse(item.addonIds) : [],
      }));

      // Recuperamos el restaurantId del primer ítem si existe
      const restaurantId = items.length > 0 ? items[0].product.restaurantId : null;

      set({ items, restaurantId, loading: false });
    } catch (err) {
      console.error('Error al cargar el carrito:', err);
      set({ loading: false });
    }
  },

  // ─── Agregar ítem a BD ──────────────────────────────────────────────────────
  addItem: async (item: CartItem) => {
    try {
      // Opcional: Validación en el frontend por si acaso
      const currentRestaurant = get().restaurantId;
      if (currentRestaurant && currentRestaurant !== item.product.restaurantId) {
        console.warn("No puedes agregar productos de diferentes restaurantes.");
        return;
      }

      await api.post('/cart', {
        productId: item.product.id,
        sizeId:    item.sizeId    ?? null,
        drinkId:   item.drinkId   ?? null,
        quantity:  item.quantity,
        unitPrice: item.unitPrice,
        notes:     item.notes     ?? null,
        // Serializamos los addons a string para la columna VarChar de MySQL
        addonIds:  item.addonIds  ? JSON.stringify(item.addonIds) : "[]",
      });
      
      // Refrescar estado completo desde la BD para asegurar consistencia e IDs reales
      await get().fetchCart();
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
    }
  },

  // ─── Eliminar ítem de BD ────────────────────────────────────────────────────
  removeItem: async (id: number) => {
    try {
      await api.delete(`/cart/${id}`);
      set((state) => {
        const newItems = state.items.filter((i) => i.id !== id);
        return {
          items: newItems,
          restaurantId: newItems.length > 0 ? newItems[0].product.restaurantId : null
        };
      });
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
    }
  },

  // ─── Actualizar cantidad en BD ──────────────────────────────────────────────
  updateQuantity: async (id: number, qty: number) => {
    try {
      await api.patch(`/cart/${id}`, { quantity: qty });
      set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, quantity: qty } : i),
      }));
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
    }
  },

  // ─── Vaciar carrito en BD ───────────────────────────────────────────────────
  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [], restaurantId: null });
    } catch (err) {
      console.error('Error al vaciar carrito:', err);
    }
  },

  // ─── Limpiar carrito local (Útil para el Logout) ───────────────────────────
  clearCartLocal: () => set({ items: [], restaurantId: null }),

  // ─── Calcular totales utilizando el estado actual ───────────────────────────
  total: () =>
    get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),

  itemCount: () =>
    get().items.reduce((acc, item) => acc + item.quantity, 0),
}));