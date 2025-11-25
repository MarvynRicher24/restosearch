import { beforeEach, describe, expect, it } from 'vitest'
import { useAuth } from '../../app/composables/useAuth'
import { useCart } from '../../app/composables/useCart'

describe('useCart composable', () => {
  beforeEach(() => {
    localStorage.clear()
    const a = useAuth()
    a.logout()
  })

  it('adds items, merges duplicates and computes totals/count', () => {
    const a = useAuth()
    a.setSession({ id: 'u1', email: 'me@test.com', role: 'user' }, 't1')

    const cart = useCart()
    cart.clear()

    cart.add({ id: 'd1', name: 'Dish 1', price: 5, qty: 2, restaurant: { id: 'r1' } })
    expect(cart.items.value.length).toBe(1)
    expect(cart.count.value).toBe(2)
    expect(cart.total.value).toBe(10)

    // add duplicate merges qty
    cart.add({ id: 'd1', price: 5, restaurant: { id: 'r1' } })
    expect(cart.count.value).toBe(3)
    expect(cart.total.value).toBe(15)
  })

  it('updateQty removes item when qty <= 0', () => {
    const a = useAuth()
    a.setSession({ id: 'u2', email: 'you@test.com', role: 'user' }, 't2')

    const cart = useCart()
    cart.clear()
    cart.add({ id: 'd2', price: 3, qty: 1, restaurant: { id: 'r2' } })
    expect(cart.items.value.length).toBe(1)

    cart.updateQty('d2', 'r2', 0)
    expect(cart.items.value.length).toBe(0)
  })

  it('persists to localStorage under user-specific key', () => {
    const a = useAuth()
    a.setSession({ id: 'u3', email: 'persist@test.com', role: 'user' }, 't3')

    const cart = useCart()
    cart.clear()
    cart.add({ id: 'd3', price: 2, qty: 1, restaurant: { id: 'r3' } })

    const raw = localStorage.getItem('resto_cart_persist@test.com')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed.length).toBe(1)
  })
})
