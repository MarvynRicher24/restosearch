<template>
  <div class="container">
    <button class="back" @click="goBack">← Retour</button>
    <h1 class="title">Modifier le restaurateur</h1>

    <div v-if="!loaded" class="muted">Chargement...</div>

    <div v-else class="auth-card">
      <form @submit.prevent="submit">
        <div class="field">
          <label>Nom</label>
          <input v-model="name" type="text" required />
        </div>

        <div class="field">
          <label>Adresse</label>
          <input v-model="address" type="text" />
        </div>

        <div class="field">
          <label>Code postal</label>
          <input v-model="postalCode" type="text" />
        </div>

        <div class="field">
          <label>Ville</label>
          <input v-model="city" type="text" />
        </div>

        <div class="field">
          <label>Email (non modifiable)</label>
          <input v-model="email" type="email" disabled />
        </div>

        <div class="field">
          <label>Mot de passe (laisser vide pour ne pas changer)</label>
          <input v-model="password" type="password" minlength="6" />
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary btn-lg">Enregistrer</button>
          <button type="button" class="btn subtle" @click="goBack" style="margin-left:8px">Annuler</button>
        </div>
      </form>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from '#app'
import { useAuth } from '../../../composables/useAuth'
import type { User } from '../../../../types'

const router = useRouter()
const route = useRoute()
const { user, isLogged, isAdmin } = useAuth()

const emailParam = String(route.params.email || '')

const loaded = ref(false)
const name = ref('')
const address = ref('')
const postalCode = ref('')
const city = ref('')
const password = ref('')
const email = ref('')
const message = ref('')

onMounted(async () => {
  if (!isLogged.value || !isAdmin.value) {
    router.push('/admin')
    return
  }

  email.value = decodeURIComponent(emailParam)

  // try to find user in base file first
  try {
    const base = await $fetch('/data/users.json').catch(() => [])
    const baseArr = Array.isArray(base) ? base : []
    const foundBase = baseArr.find((u: any) => (u.email || '') === email.value)
    if (foundBase) {
      populate(foundBase)
      loaded.value = true
      return
    }
  } catch (e) {}

  // fallback to local storage
  try {
    const raw = localStorage.getItem('resto_users_custom') || '[]'
    const arr = JSON.parse(raw || '[]')
    if (Array.isArray(arr)) {
      const found = arr.find((u: any) => (u.email || '') === email.value)
      if (found) populate(found)
    }
  } catch (e) {}

  loaded.value = true
})

function populate(u: any) {
  name.value = u.name || ''
  address.value = u.address || ''
  postalCode.value = u.postalCode || ''
  city.value = u.city || ''
  email.value = u.email || ''
}

function goBack() {
  router.push('/admin/dashboard')
}

async function submit() {
  message.value = ''
  if (!name.value || !email.value) {
    message.value = 'Nom et email requis.'
    return
  }

  const updated: any = {
    id: `p${Date.now()}`,
    name: name.value,
    email: email.value,
    role: 'professional',
    address: address.value || '',
    postalCode: postalCode.value || '',
    city: city.value || '',
    createdAt: Date.now()
  }

  // preserve password if provided
  if (password.value && password.value.length >= 6) {
    (updated as any).password = password.value
  }

  try {
    // prefer to sync custom storage locally; server update not available
    const raw = localStorage.getItem('resto_users_custom') || '[]'
    const arr = JSON.parse(raw || '[]')
    if (Array.isArray(arr)) {
      const idx = arr.findIndex((u: any) => (u.email || '') === email.value)
      if (idx !== -1) arr[idx] = { ...arr[idx], ...updated }
      else arr.push(updated)
      localStorage.setItem('resto_users_custom', JSON.stringify(arr))
    } else {
      localStorage.setItem('resto_users_custom', JSON.stringify([updated]))
    }
    message.value = 'Modifications enregistrées.'
    setTimeout(() => router.push('/admin/dashboard'), 700)
  } catch (e) {
    message.value = 'Impossible de sauvegarder les modifications.'
  }
}
</script>

<style scoped>
.auth-card { background: var(--card-bg); padding: 20px; border-radius: 12px; box-shadow: var(--shadow-1); border:1px solid rgba(2,6,23,0.04); margin-bottom:12px }
.field { margin-bottom:12px }
.field label { display:block; font-size:0.9rem; margin-bottom:6px }
.field input { width:100%; padding:10px 12px; border:1px solid rgba(2,6,23,0.06); border-radius:10px; background: rgba(15,23,42,0.02) }
.actions { margin-top:8px }
.btn {cursor:pointer}
.btn-primary.btn-lg { padding:10px 16px; border-radius:10px; box-shadow: var(--shadow-1) }
.message { margin-top:12px; color:var(--muted) }
.back { display: inline-flex; align-items: center; gap: 8px; margin: 12px 0; color: var(--muted); background: var(--card-bg); border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 999px; padding: 8px 12px; box-shadow: var(--shadow-1); text-decoration: none; cursor: pointer; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease }
.back:hover { border-color: var(--accent); color: var(--accent) }
</style>
