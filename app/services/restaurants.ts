import type { Restaurant } from '../../types'
import { apiFetch } from './api'

export const getRestaurants = async (): Promise<Restaurant[]> => {
  return apiFetch<Restaurant[]>('/api/restaurants')
}

export default { getRestaurants }
