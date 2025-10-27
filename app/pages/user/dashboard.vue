<template>
	<div class="container">
		<h1 class="title">Tableau de bord — Utilisateur</h1>
		<p v-if="!user">Vérification en cours...</p>

		<div v-else class="main">
				<div class="header">
					<div class="user-box">
						<div class="avatar">{{ user.name?.slice(0,1) || 'U' }}</div>
						<div>
							<p class="welcome">Bienvenue, <strong>{{ user.name }}</strong></p>
							<p class="email">{{ user.email }} — <em>{{ user.role }}</em></p>
						</div>
					</div>
					<div class="actions-top">
						<button class="logout" @click="doLogout">Se déconnecter</button>
					</div>
				</div>

				<section class="controls">
					<p class="subtitle">Vos actions</p>
					<div class="cards">
						<NuxtLink to="/user/orders" class="card card-link">
							<div>
								<strong>Commandes</strong>
								<div class="muted">Voir l'historique de vos commandes</div>
							</div>
						</NuxtLink>
						<NuxtLink to="/user/settings" class="card card-link">
							<div>
								<strong>Paramètres</strong>
								<div class="muted">Modifier votre profil</div>
							</div>
						</NuxtLink>
					</div>
				</section>


		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'

const { items, total } = useCart()

function formatPrice(p: any) {
	return typeof p === 'number' ? p.toFixed(2) + ' €' : p
}

const router = useRouter()
const { user, isLogged, isAdmin, logout } = useAuth()

onMounted(() => {
		if (!isLogged.value) {
			router.push('/auth')
			return
		}
		// empêcher l'accès si rôle non 'user'
		if (user.value?.role !== 'user') {
			router.push('/auth')
			return
		}
})

function doLogout() {
	logout()
	router.push('/')
}
</script>

<style scoped>
.title { margin-bottom: 8px }
.main { margin-top: 12px }
.header { display:flex; justify-content:space-between; align-items:center; gap:16px }
.user-box { display:flex; gap:12px; align-items:center }
.avatar { width:56px; height:56px; border-radius:999px; background:var(--accent); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-weight:800 }
.welcome { margin:0; font-size:1.1rem }
.email { margin:0; color:var(--muted) }
.actions-top { display:flex; gap:8px; align-items:center }
.link.small { padding:6px 10px; background:transparent; border-radius:8px; border:1px solid rgba(2,6,23,0.04); text-decoration:none; color:var(--text) }
.subtitle { margin: 12px 0 }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap:12px }
.card { background:#fff; border:1px solid #e5e7eb; padding:16px; border-radius:8px; box-shadow:0 4px 14px rgba(2,6,23,0.03); display:flex; justify-content:space-between; align-items:center }
.card-link { text-decoration:none; color:inherit }
.card-meta { color:var(--muted); font-weight:700 }
.logout { padding:8px 12px; background:#111827; color:white; border:none; border-radius:6px; cursor:pointer }
</style>

