import { ref } from 'vue'
import { useAuth } from './useAuth'

type OrderItem = {
  id?: string
  name?: string
  price?: number
  qty?: number
  restaurant?: { id?: string; name?: string }
}

type Order = {
  id: string
  date: string
  items: OrderItem[]
  total: number
  count: number
  status?: string
}

function storageKey(email?: string) {
  if (!email) return 'resto_orders_guest'
  return `resto_orders_${email}`
}

export function useOrders() {
  const { user } = useAuth()

  function load(): Order[] {
    try {
      const raw = localStorage.getItem(storageKey(user.value?.email)) || '[]'
      return JSON.parse(raw) as Order[]
    } catch (e) {
      return []
    }
  }

  function saveAll(orders: Order[]) {
    try {
      localStorage.setItem(storageKey(user.value?.email), JSON.stringify(orders))
    } catch (e) {
      // ignore
    }
  }

  function add(order: Omit<Order, 'id' | 'date'>) {
    const all = load()
    const id = String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8)
    const o: Order = {
      id,
      date: new Date().toISOString(),
      items: order.items,
      total: order.total,
      count: order.count,
      status: order.status || 'confirmed'
    }
    all.unshift(o)
    saveAll(all)
    return o
  }

  return {
    load,
    add,
    storageKey
  }
}
