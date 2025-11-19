// types/index.ts

/**
 * Représente un restaurant public affiché dans l'application.
 */
export interface Restaurant {
  id: string;
  name: string;
  image: string;
  location: string;
  cuisine: string;
  rating?: number;
  short?: string;
}

/**
 * Représente un plat proposé par un restaurant ou un professionnel.
 */
export interface Dish {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  ownerId?: string;
  createdAt?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'professional' | 'user';
  image?: string;
  createdAt?: number;
  // Professional-specific (optional)
  restaurant?: string;
  restaurantName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  description?: string;
  bio?: string;
  phone?: string;
}

export type DishesMap = Record<string, Dish[]>;

export interface SearchFilters {
  query: string;
  cuisine: string;
  sortBy: "relevance" | "rating" | "name";
}

// Re-export runtime helpers and utility types from the local `types/utils.ts`.
/**
 * User stored in the public JSON files (may include password for auth simulation).
 * Use `UserWithPassword` for client-side auth flows where a `password` field
 * can appear (localStorage / public seed data). Passwords are only used in
 * development/testing and must not be shipped to production in cleartext.
 */
export type UserWithPassword = User & { password?: string };

export * from './utils'

/**
 * Cart item used across the app and stored in localStorage per user.
 */
export type CartItem = Partial<Dish> & {
  qty?: number;
  restaurant?: { id?: string; name?: string };
};

/**
 * Item within an order.
 */
export type OrderItem = {
  id?: string;
  name?: string;
  price?: number;
  qty?: number;
  restaurant?: { id?: string; name?: string };
};

/**
 * Order record stored per user.
 */
export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  count: number;
  status?: string;
};
