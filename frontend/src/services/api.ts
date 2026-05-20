import api from './http';
import type { ApiResponse, Product, Category, Order, Offer, Restaurant, User } from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  me: () => api.get<ApiResponse<User>>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: { page?: number; limit?: number; categoryId?: number; search?: string }) =>
    api.get<ApiResponse<Product[]>>('/products', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: Partial<Product>) =>
    api.post<ApiResponse<Product>>('/products', data),

  update: (id: number, data: Partial<Product>) =>
    api.put<ApiResponse<Product>>(`/products/${id}`, data),

  toggle: (id: number) =>
    api.patch<ApiResponse<Product>>(`/products/${id}/toggle`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data: unknown) =>
    api.post<ApiResponse<Order>>('/orders', data),

  getMine: (page = 1) =>
    api.get<ApiResponse<Order[]>>('/orders/my', { params: { page } }),

  getAll: (params?: { page?: number; status?: string }) =>
    api.get<ApiResponse<Order[]>>('/orders', { params }),

  updateStatus: (id: number, status: string) =>
    api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status }),
};

// ─── Offers ───────────────────────────────────────────────────────────────────
export const offerApi = {
  getAll: () => api.get<ApiResponse<Offer[]>>('/offers'),

  create: (data: Partial<Offer>) => api.post<ApiResponse<Offer>>('/offers', data),

  update: (id: number, data: Partial<Offer>) =>
    api.put<ApiResponse<Offer>>(`/offers/${id}`, data),

  toggle: (id: number) => api.patch(`/offers/${id}/toggle`),
};

// ─── Restaurants ──────────────────────────────────────────────────────────────
export const restaurantApi = {
  getAll: () => api.get<ApiResponse<Restaurant[]>>('/restaurants'),
  create: (data: Partial<Restaurant>) => api.post('/restaurants', data),
  update: (id: number, data: Partial<Restaurant>) => api.put(`/restaurants/${id}`, data),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportApi = {
  salesByDay: () => api.get('/reports/sales/by-day'),
  salesByDayPart: () => api.get('/reports/sales/by-daypart'),
  salesByHour: () => api.get('/reports/sales/by-hour'),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get<ApiResponse<User[]>>('/users'),
  toggle: (id: number) => api.patch(`/users/${id}/toggle`),
  getProfile: () => api.get<ApiResponse<User>>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: unknown) => api.post('/users/addresses', data),
};
