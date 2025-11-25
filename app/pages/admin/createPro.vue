<template>
  <div class="container">
    <div class="create-top">
    <button class="back" @click="goBack">← Mon profil</button>
    <h1>Créer un restaurateur</h1>
    </div>

    <div class="auth-card">
      <form @submit.prevent="submit">
        <div class="field">
          <label>Nom du restaurant</label>
          <input v-model="name" type="text" required />
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

        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" required />
        </div>

        <div class="field">
          <label>Mot de passe</label>
          <input v-model="password" type="password" required minlength="6" />
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary btn-lg">Créer le compte</button>
        </div>
      </form>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged, isAdmin } = useAuth()

const name = ref('')
const address = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const password = ref('')
const message = ref('')

if (process.client) {
  if (!isLogged.value || !isAdmin.value) {
    router.push('/admin')
  }
}

async function submit() {
  if (!email.value || password.value.length < 6 || !name.value || !address.value || !postalCode.value || !city.value) {
    message.value = 'Veuillez remplir les champs requis (nom, adresse, code postal, ville, email, mot de passe ≥6).' 
    return
  }
  const newUser = {
    id: `p${Date.now()}`,
    name: name.value,
    email: email.value,
    password: password.value,
    role: 'professional',
    address: address.value || '',
    postalCode: postalCode.value || '',
    city: city.value || '',
    createdAt: Date.now()
  }
  try {
    // try to persist server-side via API
    try {
      const res = await $fetch('/api/admin/createPro', { method: 'POST', body: newUser })
      // server persisted — do NOT duplicate in localStorage (dashboard reads from server + localStorage)
      message.value = 'Professionnel créé (serveur).'
      setTimeout(() => router.push('/admin/dashboard'), 600)
      return
    } catch (e) {
      // if server fails, fallback to client-side storage
    }

    const raw = localStorage.getItem('resto_users_custom') || '[]'
    const arr = JSON.parse(raw || '[]')
    arr.push(newUser)
    localStorage.setItem('resto_users_custom', JSON.stringify(arr))
    message.value = 'Professionnel créé (local).' 
    setTimeout(() => router.push('/admin/dashboard'), 600)
  } catch (e) {
    message.value = 'Impossible de sauvegarder.'
  }
}

function goBack() {
  router.push('/admin/dashboard')
}
</script>

<style scoped>
/* reuse styles similar to auth */
.auth-card { background: var(--card-bg); padding: 20px; border-radius: 12px; box-shadow: var(--shadow-1); border:1px solid rgba(2,6,23,0.04); margin-bottom:12px }
.field { margin-bottom:12px }
.field label { display:block; font-size:0.9rem; margin-bottom:6px }
.field input { width:100%; padding:10px 12px; border:1px solid rgba(2,6,23,0.06); border-radius:10px; background: rgba(15,23,42,0.02) }
.actions { margin-top:8px }
.btn-primary.btn-lg { padding:10px 16px; border-radius:10px; box-shadow: var(--shadow-1) }
 .message { margin-top:12px; color:var(--muted) }

/* back button style (copied from pages/user/orders.vue) */
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
