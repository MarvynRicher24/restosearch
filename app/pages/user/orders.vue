<template>
  <div class="container">
    <div class="orders-top">
      <button class="back" @click="goBack">← Mon profil</button>
      <h1>Commandes passées</h1>
    </div>

    <div v-if="orders.length === 0" class="empty">Vous n'avez aucune commande pour le moment.</div>

    <div v-else class="orders-list">
      <article v-for="o in orders" :key="o.id" class="order-card">
        <header class="order-head">
          <div>
            <strong>Commande #{{ o.id }}</strong>
            <div class="muted">Le {{ formatDate(o.date) }}</div>
          </div>
          <div class="order-meta">
            <div class="muted">{{ o.count }} items</div>
            <div class="total">{{ formatPrice(o.total) }}</div>
          </div>
        </header>
        <ul class="order-items">
          <li v-for="it in o.items" :key="it.id" class="order-item">
            <div class="it-left">
              <div class="it-name">{{ it.name }}</div>
              <div class="muted it-resto">{{ it.restaurant?.name || '' }}</div>
            </div>
            <div class="it-right">
              <div class="muted">x{{ it.qty || 1 }}</div>
              <div class="it-price">{{ formatPrice((it.price || 0) * (it.qty || 1)) }}</div>
            </div>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useOrders } from '../../composables/useOrders'
import { useRouter } from '#app'

const router = useRouter()
const { user, isLogged } = useAuth()
const orders = ref<any[]>([])

onMounted(() => {
  if (!isLogged.value) {
    router.push('/auth')
    return
  }
  const o = useOrders()
  orders.value = o.load()
})

function goBack() {
  router.push('/user/dashboard')
}

function formatPrice(p: any) {
  return typeof p === 'number' ? p.toFixed(2) + ' €' : p
}
function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString()
  } catch (e) {
    return d
  }
}
</script>

<style scoped>
.orders-list { display:flex; flex-direction:column; gap:12px; margin-top:12px }
.order-card { background:#fff; border:1px solid #e6eef8; padding:12px; border-radius:8px }
.order-head { display:flex; justify-content:space-between; align-items:center }
.order-meta { text-align:right }
.order-items { list-style:none; padding:0; margin:8px 0 0 }
.order-item { display:flex; justify-content:space-between; gap:12px; padding:8px 0; border-top:1px dashed #f1f5f9 }
.order-item:first-of-type { border-top:0 }
.it-name { font-weight:600 }
.it-resto { font-size:0.9rem }
.it-price { font-weight:700 }
.total { font-weight:800; color:var(--accent) }
.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  color: var(--muted);
  background: var(--card-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: var(--shadow-1);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;
}
.back:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.back:active {
  transform: translateY(1px);
}
.back:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
