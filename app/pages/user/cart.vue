<template>
	<div class="container cart-page">
		<h1>Mon panier</h1>

		<div v-if="items.length === 0" class="empty">Votre panier est vide.</div>

		<div v-else class="cart-panel">
			<div class="items">
				<div v-for="(it, idx) in items" :key="idx" class="cart-item">
					<div class="left">
						<div class="thumb-wrap">
							<img v-if="(it as any).image" :src="(it as any).image" alt="" class="thumb" />
							<div v-else class="thumb placeholder"></div>
						</div>
						<div>
							<div class="name">{{ it.name }}</div>
							<div class="resto">{{ it.restaurant?.name || '-' }}</div>
						</div>
					</div>
					<div class="center">
						<div class="price">{{ formatPrice(it.price) }}</div>
						<div class="qty">
							<button @click="decreaseQty(it)">−</button>
							<span>{{ it.qty || 1 }}</span>
							<button @click="increaseQty(it)">+</button>
						</div>
					</div>
					<div class="right">
						<div class="sub">{{ formatPrice((it.price || 0) * (it.qty || 1)) }}</div>
						<button class="remove" @click="removeItem(it)">Supprimer</button>
					</div>
				</div>
			</div>

			<aside class="summary">
				<h2>Récapitulatif</h2>
				<div class="summary-row">
					<span>Articles</span>
					<span>{{ count }}</span>
				</div>
				<div class="summary-row total">
					<strong>Total</strong>
					<strong>{{ formatPrice(total) }}</strong>
				</div>
				<div class="summary-actions">
					<button class="btn btn-secondary" @click="clearCart">Vider le panier</button>
					<button class="btn btn-primary" @click="checkout">Valider la commande</button>
				</div>
			</aside>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'
import { useOrders } from '../../composables/useOrders'

const router = useRouter()
const { user, isLogged, logout } = useAuth()
const { items, total, count, load, remove, updateQty, clear } = useCart()

if (!isLogged.value) {
	router.push('/auth')
}

function formatPrice(p: any) {
	return typeof p === 'number' ? p.toFixed(2) + ' €' : p
}

function increaseQty(it: any) {
	const next = (it.qty || 1) + 1
	updateQty(it.id, it.restaurant?.id, next)
}

function decreaseQty(it: any) {
	const next = (it.qty || 1) - 1
	updateQty(it.id, it.restaurant?.id, next)
}

function removeItem(it: any) {
	remove(it.id, it.restaurant?.id)
}

function clearCart() {
	clear()
}

function checkout() {
	// validate current cart and create an order saved to user's past orders
	if (!isLogged.value || !user.value) {
		router.push('/auth')
		return
	}
	const orders = useOrders()
		const snapshot = (items.value || []).map((i: any) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, restaurant: i.restaurant }))
	const o = orders.add({ items: snapshot, total: total.value, count: count.value })
	// clear cart
	clear()
	// navigate to commandes passées
	router.push('/user/orders')
}

// ensure cart loaded for current user
load()
</script>

<style scoped>
.cart-page { padding-top: 16px }
.empty { color: var(--muted); padding: 12px 0 }
.cart-panel { display:flex; gap:20px; align-items:flex-start }
.items { flex: 1 }
.cart-item { display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #e6eef8; border-radius:8px; margin-bottom:10px; background:#fff }
.cart-item .left { display:flex; gap:12px; align-items:center; min-width: 220px }
.thumb { width:72px; height:72px; object-fit:cover; border-radius:8px }
.thumb.placeholder { background:#f3f4f6; width:72px; height:72px; border-radius:8px }
.name { font-weight:600 }
.resto { color:var(--muted); font-size:0.9rem }
.center { display:flex; gap:12px; align-items:center }
.price { font-weight:600 }
.qty { display:flex; gap:8px; align-items:center }
.qty button { padding:6px 8px; border-radius:6px; border:1px solid #e5e7eb; background:#fff; cursor:pointer }
.right { text-align:right }
.remove { background:transparent; border:none; color:#ef4444; cursor:pointer; margin-top:8px }
.summary { width:300px; background:#fff; border:1px solid #e6eef8; padding:16px; border-radius:8px }
.summary-row { display:flex; justify-content:space-between; padding:8px 0 }
.summary-row.total { border-top:1px dashed #e6eef8; margin-top:8px; padding-top:12px }
.summary-actions { display:flex; gap:8px; margin-top:12px }
.btn { cursor:pointer }
.btn-primary { background:var(--accent); color:#fff; padding:8px 12px; border-radius:6px; border:none }
.btn-secondary { background:#f3f4f6; color:#111827; padding:8px 12px; border-radius:6px; border:1px solid #e5e7eb }
</style>
