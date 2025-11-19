import type { User } from '../../types'
import { apiFetch } from './api'

export const updateUser = async (payload: Partial<User>): Promise<User> => {
  return apiFetch<User>('/api/professional/updateProfile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export default { updateUser }
