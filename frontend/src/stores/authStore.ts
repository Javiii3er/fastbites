import { create } from 'zustand';
import type { User } from '../types';
import { useCartStore } from './cartStore';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('fb_token');
const storedUser  = localStorage.getItem('fb_user');

export const useAuthStore = create<AuthStore>((set) => ({
  user:            storedUser ? JSON.parse(storedUser) : null,
  token:           storedToken,
  isAuthenticated: !!storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('fb_token', token);
    localStorage.setItem('fb_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
    // Cargar el carrito del usuario que acaba de iniciar sesión
    useCartStore.getState().fetchCart();
  },

  logout: () => {
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    // Limpiar carrito local al cerrar sesión
    useCartStore.getState().clearCartLocal();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));