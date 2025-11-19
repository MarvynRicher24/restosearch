import type { User } from '../../types'
import { apiFetch } from './api'

export const getUsers = async (): Promise<User[]> => {
  return apiFetch<User[]>('/api/users')
}

export default { getUsers }
