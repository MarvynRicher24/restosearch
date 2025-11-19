import type { Restaurant } from '../../types'
import { apiFetch } from './api'

/** Retourne la liste des restaurants depuis l'API (typée). */
export const getRestaurants = async (): Promise<Restaurant[]> => {
  return apiFetch<Restaurant[]>('/api/restaurants')
}

export default { getRestaurants }
