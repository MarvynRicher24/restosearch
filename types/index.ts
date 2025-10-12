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
  image: string;
}

export interface AuthUser {
  email: string;
  createdAt?: number;
}

export interface AuthResponse {
  email: string;
  token: string;
  error?: string;
}

export type DishesMap = Record<string, Dish[]>;

export interface SearchFilters {
  query: string;
  cuisine: string;
  sortBy: "relevance" | "rating" | "name";
}
