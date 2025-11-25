import { beforeEach, describe, expect, it } from 'vitest'
import { useAuth } from '../../app/composables/useAuth'

describe('useAuth composable', () => {
  beforeEach(() => {
    localStorage.clear()
    const a = useAuth()
    a.logout()
  })

  it('setSession stores user and token and exposes computed flags', () => {
    const a = useAuth()
    a.setSession({ id: '1', email: 'u@test.com', role: 'user' }, 'tok-123')

    expect(a.user.value).not.toBeNull()
    expect(a.user.value?.email).toBe('u@test.com')
    expect(a.token.value).toBe('tok-123')
    expect(a.isLogged.value).toBe(true)
    expect(a.isAdmin.value).toBe(false)

    // persisted
    const rawUser = localStorage.getItem('resto_user')
    const rawToken = localStorage.getItem('resto_token')
    expect(rawUser).not.toBeNull()
    expect(rawToken).toBe('tok-123')
  })

  it('isAdmin is true for admin role and logout clears session', () => {
    const a = useAuth()
    a.setSession({ id: '2', email: 'admin@test.com', role: 'admin' }, 'admintok')
    expect(a.isAdmin.value).toBe(true)

    a.logout()
    expect(a.user.value).toBeNull()
    expect(a.token.value).toBeNull()
    expect(localStorage.getItem('resto_user')).toBeNull()
    expect(localStorage.getItem('resto_token')).toBeNull()
  })
})
