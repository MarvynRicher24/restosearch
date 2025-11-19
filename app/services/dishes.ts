import type { Dish } from '../../types'
import { apiFetch } from './api'

export const getDishes = async (): Promise<Dish[]> => {
  return apiFetch<Dish[]>('/api/dishes')
}

export const getCustomProfessionalDishes = async (): Promise<Dish[]> => {
  return apiFetch<Dish[]>('/api/professional/dishes_custom')
}

export const postDish = async (payload: Partial<Dish>): Promise<Dish> => {
  return apiFetch<Dish>('/api/dishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export default {
  getDishes,
  getCustomProfessionalDishes,
  postDish
}
