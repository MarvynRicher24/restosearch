import type { Dish } from '../../types'
import { apiFetch } from './api'

/** Retourne la map / liste des plats disponibles (typé). */
export const getDishes = async (): Promise<Dish[]> => {
  return apiFetch<Dish[]>('/api/dishes')
}

/** Retourne les plats personnalisés fournis par des professionnels. */
export const getCustomProfessionalDishes = async (): Promise<Dish[]> => {
  return apiFetch<Dish[]>('/api/professional/dishes_custom')
}

/** Publie un nouveau plat (utilisé par l'interface pro). */
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
