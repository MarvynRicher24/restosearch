import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import type { CartItem } from '../../types'

const items = ref<CartItem[]>([])
let currentKey = ''

function storageKeyFor(email?: string) {
  if (!email) return 'resto_cart_guest'
  return `resto_cart_${email}`
}

export function useCart() {
  const { user } = useAuth()

  function load() {
    const key = storageKeyFor(user.value?.email)
    currentKey = key
    try {
      const raw = localStorage.getItem(key) || '[]'
      items.value = JSON.parse(raw) as CartItem[]
    } catch (e) {
      items.value = []
    }
  }

  function save() {
    try {
      localStorage.setItem(currentKey || storageKeyFor(user.value?.email), JSON.stringify(items.value))
    } catch (e) {
      // ignore
    }
  }

  function add(item: CartItem) {
    // allow duplicates (separate entries) or merge by id — we'll merge by id+restaurant
    const existing = items.value.find(i => i.id === item.id && i.restaurant?.id === item.restaurant?.id)
    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1)
    } else {
      items.value.push({ ...item, qty: item.qty ?? 1 })
    }
    save()
  }

  function remove(itemId?: string, restaurantId?: string) {
    const idx = items.value.findIndex(i => i.id === itemId && i.restaurant?.id === restaurantId)
    if (idx !== -1) {
      items.value.splice(idx, 1)
      save()
    }
  }

  function updateQty(itemId?: string, restaurantId?: string, qty = 1) {
    const it = items.value.find(i => i.id === itemId && i.restaurant?.id === restaurantId)
    if (it) {
      it.qty = qty
      if (it.qty && it.qty <= 0) {
        // remove
        const idx = items.value.indexOf(it)
        if (idx !== -1) items.value.splice(idx, 1)
      }
      save()
    }
  }

  function clear() {
    items.value = []
    save()
  }

  const count = computed(() => items.value.reduce((s, i) => s + (i.qty || 1), 0))
  const total = computed(() => items.value.reduce((s, i) => s + ((i.price || 0) * (i.qty || 1)), 0))

  // reload when user changes
  watch(() => user.value?.email, () => {
    load()
  })

  // init
  load()

  return {
    items,
    add,
    remove,
    updateQty,
    clear,
    load,
    count,
    total
  }
}
