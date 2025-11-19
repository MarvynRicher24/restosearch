// app/stores/index.ts
// Barrel file to expose common state utilities without changing behaviour.
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import { useOrders } from '../composables/useOrders'
import { useToast } from '../composables/useToast'

export { useAuth, useCart, useOrders, useToast }

export default {
  useAuth,
  useCart,
  useOrders,
  useToast
}
