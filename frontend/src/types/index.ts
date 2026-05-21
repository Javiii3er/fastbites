// ─── Auth ─────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'MANAGER' | 'CLIENT';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export type DayPart = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface Category {
  id: number;
  name: string;
  dayPart: DayPart;
  imageUrl?: string;
}

export interface ProductSize {
  id: number;
  name: string;
  extraPrice: number;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface Drink {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  category: Category;
  sizes: ProductSize[];
  addons: Addon[];
  drinks: Drink[];
}

// ─── Addresses ────────────────────────────────────────────────────────────────
export interface Address {
  id: number;
  alias: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PREPARING'
  | 'READY'   | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'CASH';

export interface CartItem {
  product: Product;
  sizeId?: number;
  drinkId?: number;
  addonIds: number[];
  quantity: number;
  notes?: string;
  unitPrice: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  restaurant: { name: string };
  address?: Address;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { name: string; imageUrl?: string };
}

// ─── Offers ───────────────────────────────────────────────────────────────────
export interface Offer {
  id: number;
  title: string;
  description?: string;
  discount: number;
  code?: string;
  imageUrl?: string;
  endsAt: string;
}

// ─── Restaurants ──────────────────────────────────────────────────────────────
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  dayParts: { dayPart: DayPart; startTime: string; endTime: string }[];
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}