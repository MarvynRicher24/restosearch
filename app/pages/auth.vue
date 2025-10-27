<template>
  <div class="container">
    <h1>Connexion / Inscription</h1>

    <div class="tabs">
      <button :class="{active: mode === 'login'}" @click="mode = 'login'">Se connecter</button>
      <button :class="{active: mode === 'register'}" @click="mode = 'register'">S'inscrire</button>
    </div>

    <form @submit.prevent="submit">
      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div v-if="mode === 'register'" class="field">
        <label>Pseudo</label>
        <input v-model="form.pseudo" type="text" />
      </div>

      <div class="field">
        <label>Mot de passe</label>
        <input v-model="form.password" type="password" required minlength="6" />
      </div>

      <div class="actions">
        <button type="submit">{{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}</button>
      </div>
    </form>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'

const router = useRouter()
const mode = ref<'login'|'register'>('login')

const form = reactive({ email: '', password: '', pseudo: '' })
const message = ref('')
const users = ref<Array<Record<string, any>>>([])

async function loadUsers() {
  try {
    const res = await $fetch('/data/users.json')
    users.value = Array.isArray(res) ? res : []
  } catch (e) {
    users.value = []
  }
}

onMounted(() => {
  loadUsers()
})

function fakeToken() {
  return Math.random().toString(36).slice(2)
}

async function submit() {
  message.value = ''
  const email = form.email?.trim().toLowerCase()
  const pwd = form.password || ''

  if (!email || pwd.length < 6) {
    message.value = 'Email valide et mot de passe d\'au moins 6 caractères requis.'
    return
  }

  const { setSession } = useAuth()

  const cart = useCart()

  if (mode.value === 'login') {
    if (users.value.length === 0) await loadUsers()
    const user = users.value.find((u) => (u.email || '').toLowerCase() === email && u.password === pwd)
    if (!user) {
      message.value = 'Identifiants incorrects.'
      return
    }
  const token = fakeToken()
  // centraliser la session via le composable
  setSession({ email: user.email, name: user.name, role: user.role }, token)
  message.value = user.role === 'admin' ? 'Connecté en tant qu\'administrateur.' : (user.role === 'professional' ? 'Connecté en tant que professionnel.' : 'Connecté en tant qu\'utilisateur.')
  } else {
    // Inscription simulée côté client (le fichier JSON public n'est pas modifié)
    const newUser = {
      id: `u${Date.now()}`,
      email,
      password: pwd,
      name: form.pseudo && form.pseudo.trim() !== '' ? form.pseudo.trim() : email.split('@')[0],
      role: 'user',
      createdAt: Date.now()
    }
    users.value.push(newUser)
    const token = fakeToken()
    setSession({ email: newUser.email, name: newUser.name, role: newUser.role }, token)
    message.value = "Inscription réussie (simulée)."
  }

  setTimeout(() => {
    // si une action en attente (ajout au panier) existe, l'exécuter puis rediriger vers la page d'origine
    const pendingRaw = localStorage.getItem('resto_pending_add')
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw)
        if (pending?.item) {
          // s'assurer que le panier est chargé pour l'utilisateur connecté
          cart.load()
          cart.add(pending.item)
        }
        localStorage.removeItem('resto_pending_add')
        const returnPath = pending?.returnPath || '/user/dashboard'
        router.push(returnPath)
        return
      } catch (e) {
        // fallback to normal redirect
      }
    }

    // Redirection selon le rôle (lecture depuis localStorage stable)
    const stored = localStorage.getItem('resto_user')
    let role = ''
    try { role = stored ? JSON.parse(stored).role : '' } catch(e) { role = '' }
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else if (role === 'professional') {
      router.push('/professional/dashboard')
    } else {
      router.push('/user/dashboard')
    }
  }, 400)
}
</script>

<style scoped>
.container { max-width: 700px; margin: 24px auto; padding: 0 16px; }
.tabs { display:flex; gap:8px; margin-bottom:16px; }
.tabs button { padding:8px 12px; border:1px solid #ddd; background:#fff; cursor:pointer }
.tabs button.active { background:var(--accent); color:white; border-color:var(--accent) }
.field { margin-bottom:12px }
.field label { display:block; font-size:0.9rem; margin-bottom:6px }
.field input { width:100%; padding:8px; border:1px solid #e5e7eb; border-radius:4px }
.actions { margin-top:8px }
.actions button { padding:8px 14px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer }
.message { margin-top:12px; color:var(--muted) }
</style>
