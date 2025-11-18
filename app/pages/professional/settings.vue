<template>
		<div class="container">
			<div class="settings-top">
				<button class="back" @click="goBack">← Mon profil</button>
				<h1 class="title">Paramètres du restaurant</h1>
			</div>

			<div class="auth-card">
			<form @submit.prevent="submit">
				<div class="field">
					<label>Nom du restaurant</label>
					<input v-model="restaurantName" type="text" required />
				</div>

				<div class="field">
					<label>Image du restaurant (webp ou jpeg)</label>
					<input ref="fileInput" @change="onFileChange" type="file" accept="image/webp,image/jpeg" />
					<div v-if="preview" class="preview">
						<img :src="preview" alt="aperçu" />
					</div>
				</div>

				<div class="field">
					<label>Adresse</label>
					<input v-model="address" type="text" required />
				</div>

				<div class="field">
					<label>Code postal</label>
					<input v-model="postalCode" type="text" required />
				</div>

				<div class="field">
					<label>Ville</label>
					<input v-model="city" type="text" required />
				</div>

				<div class="actions">
					<button type="submit" class="btn btn-primary btn-lg">Enregistrer</button>
				</div>
			</form>
		</div>

		<p v-if="message" class="message">{{ message }}</p>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, token, isLogged, setSession } = useAuth()

const restaurantName = ref('')
const address = ref('')
const postalCode = ref('')
const city = ref('')
const preview = ref<string | null>(null)
const imageData = ref<string | null>(null) // data URL to send to server
const message = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
	if (!isLogged.value) {
		router.push('/auth')
		return
	}
	// Prefill from user if available
	if (user.value) {
		restaurantName.value = user.value.restaurant || user.value.restaurantName || user.value.name || ''
		address.value = user.value.address || ''
		postalCode.value = user.value.postalCode || ''
		city.value = user.value.city || ''
	}
})

// keep fields in sync if user object changes later
watch(user, (u) => {
	if (!u) return
	restaurantName.value = u.restaurant || u.restaurantName || u.name || ''
	address.value = u.address || ''
	postalCode.value = u.postalCode || ''
	city.value = u.city || ''
	// prefill preview if server stored image
	if (u.image) {
		preview.value = u.image
	}
})

async function submit() {
	if (!restaurantName.value || !address.value || !postalCode.value || !city.value) {
		message.value = 'Veuillez remplir tous les champs.'
		return
	}

	if (!user.value) {
		message.value = 'Utilisateur introuvable.'
		return
	}

	const updated: any = {
		...user.value,
		// consolidate to a single `name` field for the restaurant
		name: restaurantName.value,
		address: address.value,
		postalCode: postalCode.value,
		city: city.value
	}
	if (imageData.value) updated.image = imageData.value

	try {
		// Try server update
		try {
			const res = await $fetch('/api/professional/updateProfile', { method: 'POST', body: updated })
			if (res && (res as any).user) {
				const serverUser = (res as any).user
				setSession(serverUser, token?.value || '')
				message.value = 'Modifications enregistrées sur le serveur.'
				// update local custom list if present
				try {
					const raw = localStorage.getItem('resto_users_custom') || '[]'
					const arr = JSON.parse(raw || '[]')
					if (Array.isArray(arr)) {
						const idx = arr.findIndex((u: any) => (u.id && user.value?.id && u.id === user.value.id) || (u.email && u.email === user.value?.email))
						if (idx !== -1) {
							arr[idx] = { ...arr[idx], ...serverUser }
							localStorage.setItem('resto_users_custom', JSON.stringify(arr))
						}
					}
				} catch (e) {}
				router.push('/professional/dashboard')
				return
			}
		} catch (err) {
			// server failed — fall back to local session update below
		}

		// local fallback (no server)
		setSession(updated, token?.value || '')
		try {
			const raw = localStorage.getItem('resto_users_custom') || '[]'
			const arr = JSON.parse(raw || '[]')
			if (Array.isArray(arr)) {
				const idx = arr.findIndex((u: any) => (u.id && user.value?.id && u.id === user.value.id) || (u.email && u.email === user.value?.email))
				if (idx !== -1) {
					arr[idx] = { ...arr[idx], ...updated }
					localStorage.setItem('resto_users_custom', JSON.stringify(arr))
				}
			}
		} catch (e) {}
		message.value = 'Modifications enregistrées (local).'
		router.push('/professional/dashboard')
	} catch (e) {
		message.value = 'Erreur lors de la sauvegarde.'
	}
}

	function goBack() {
		router.push('/professional/dashboard')
	}

function onFileChange(e: Event) {
	const el = fileInput.value
	const f = el?.files?.[0]
	if (!f) return
	const allowed = ['image/webp', 'image/jpeg']
	if (!allowed.includes(f.type)) {
		message.value = 'Format non supporté — utilisez webp ou jpeg.'
		return
	}

	const reader = new FileReader()
	reader.onload = () => {
		const result = reader.result as string
		preview.value = result
		imageData.value = result // data URL
	}
	reader.onerror = () => {
		message.value = 'Impossible de lire le fichier.'
	}
	reader.readAsDataURL(f)
}

// expose ref to template
const __ = { fileInput }
</script>

<style scoped>
.auth-card { background: var(--card-bg); padding: 20px; border-radius: 12px; box-shadow: var(--shadow-1); border:1px solid rgba(2,6,23,0.04); margin-bottom:12px }
.field { margin-bottom:12px }
.field label { display:block; font-size:0.9rem; margin-bottom:6px }
.field input { width:100%; padding:10px 12px; border:1px solid rgba(2,6,23,0.06); border-radius:10px; background: rgba(15,23,42,0.02) }
.actions { margin-top:8px }
.btn-primary.btn-lg { padding:10px 16px; border-radius:10px; box-shadow: var(--shadow-1) }
.message { margin-top:12px; color:var(--muted) }
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
.back:hover { border-color: var(--accent); color: var(--accent) }
.back:active { transform: translateY(1px) }
.back:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.empty { margin-top:12px }
</style>

