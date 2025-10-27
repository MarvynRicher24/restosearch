<template>
	<div class="container">
		<h1 class="title">Tableau de bord — Utilisateur</h1>
		<p v-if="!user">Vérification en cours...</p>

		<div v-else class="main">
			<div class="header">
				<div>
					<p class="welcome">Bienvenue, <strong>{{ user.name }}</strong></p>
					<p class="email">{{ user.email }} — <em>{{ user.role }}</em></p>
				</div>
				<div>
					<button class="logout" @click="doLogout">Se déconnecter</button>
				</div>
			</div>

						<section class="controls">
								<p class="subtitle">Vos actions</p>
								<div class="cards">
										<div class="card">Mes favoris</div>
										<div class="card">Commandes</div>
										<div class="card">Paramètres</div>
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
.welcome { margin:0; font-size:1.1rem }
.email { margin:0; color:var(--muted) }
.subtitle { margin: 12px 0 }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap:12px }
.card { background:#fff; border:1px solid #e5e7eb; padding:16px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.03) }
.logout { padding:8px 12px; background:#111827; color:white; border:none; border-radius:6px; cursor:pointer }
</style>

