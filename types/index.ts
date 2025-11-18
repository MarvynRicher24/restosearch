// types/index.ts

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  location: string;
  cuisine: string;
  rating?: number;
  short?: string;
}

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
