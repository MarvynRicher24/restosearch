// app/stores/index.ts
// Barrel file to expose common state utilities without changing behaviour.
export { useAuth } from '../composables/useAuth'
export { useCart } from '../composables/useCart'
export { useOrders } from '../composables/useOrders'
export { useToast } from '../composables/useToast'

export default {
  useAuth,
  useCart,
  useOrders,
  useToast
}
