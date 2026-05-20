import { create } from 'zustand';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  restaurantId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (item) => {
    set((state) => ({
      restaurantId: state.restaurantId ?? item.product.id,
      items: [...state.items, item],
    }));
  },

  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),

  updateQuantity: (index, qty) =>
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index ? { ...item, quantity: qty, unitPrice: item.unitPrice } : item
      ),
    })),

  clearCart: () => set({ items: [], restaurantId: null }),

  total: () =>
    get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),

  itemCount: () =>
    get().items.reduce((acc, item) => acc + item.quantity, 0),
}));
