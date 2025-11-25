import type { Dish, Restaurant, User, UserWithPassword } from './index'

// Responses / DTOs for server API endpoints
export type RestaurantsResponse = Restaurant[]

// Dishes endpoint may return a map keyed by restaurant id
export type DishesMap = Record<string, Dish[]>

export type CreateDishRequest = Dish
export type CreateDishResponse = { ok: true; dish: Dish }

export type GenericOk = { ok: true }

export type UpdateProfileRequest = Partial<User & { image?: string }>
export type UpdateProfileResponse = { ok: true; user: User }

export type CreateProRequest = Partial<UserWithPassword>
export type CreateProResponse = { ok: true; user: UserWithPassword }

export type DeleteProRequest = { email: string }

export default {}
