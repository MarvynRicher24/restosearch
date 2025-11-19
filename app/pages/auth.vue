<template>
  <div class="container">
    <h1>Connexion / Inscription</h1>

    <div class="tabs">
      <button class="tab-btn" :class="{active: mode === 'login'}" @click="mode = 'login'">Se connecter</button>
      <button class="tab-btn" :class="{active: mode === 'register'}" @click="mode = 'register'">S'inscrire</button>
    </div>

    <div class="auth-card">
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
        <button type="submit" class="btn btn-primary btn-lg">{{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}</button>
      </div>
    </form>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })
import { ref, reactive, onMounted } from 'vue'
import useSeo from '~/composables/useSeo'
import { useRouter } from '#app'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import type { UserWithPassword } from '../../types'

const router = useRouter()
const mode = ref<'login'|'register'>('login')

const form = reactive({ email: '', password: '', pseudo: '' })
const message = ref('')
const users = ref<UserWithPassword[]>([])

// mark auth page as not indexable by search engines
useHead(() => useSeo({ title: 'Connexion - RestoSearch', noindex: true }))

async function loadUsers() {
  try {
    const res = await $fetch('/data/users.json')
    const staticUsers = Array.isArray(res) ? res : []
    // charger les utilisateurs créés depuis l'admin (localStorage)
    let merged = new Map<string, UserWithPassword>()
    try {
      // start with static users
      for (const u of staticUsers as UserWithPassword[]) {
        if (u && u.email) merged.set((u.email || '').toLowerCase(), u)
      }
      const customRaw = localStorage.getItem('resto_users_custom') || '[]'
      const custom = JSON.parse(customRaw || '[]')
      if (Array.isArray(custom) && custom.length) {
        // custom users override static entries with same email
        for (const u of custom as UserWithPassword[]) {
          if (u && u.email) merged.set((u.email || '').toLowerCase(), u)
        }
      }
      users.value = Array.from(merged.values())
    } catch (e) {
      // fallback to static list
      users.value = staticUsers as UserWithPassword[]
    }
  } catch (e) {
    users.value = []
  }
}

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
  // persist the full user object in session so settings can edit all fields
  setSession(user, token)
  message.value = user.role === 'admin' ? 'Connecté en tant qu\'administrateur.' : (user.role === 'professional' ? 'Connecté en tant que professionnel.' : 'Connecté en tant qu\'utilisateur.')
  } else {
    // Inscription simulée côté client (le fichier JSON public n'est pas modifié)
    const newUser: UserWithPassword = {
      id: `u${Date.now()}`,
      email: email as string,
      password: pwd,
      name: form.pseudo && form.pseudo.trim() !== '' ? form.pseudo.trim() : (email as string).split('@')[0],
      role: 'user',
      createdAt: Date.now()
    }
    users.value.push(newUser)
    const token = fakeToken()
    // save full user object in session
    setSession(newUser, token)
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
.tab-btn {
  padding:8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(2,6,23,0.06);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  transition: background .14s cubic-bezier(.4,0,.2,1), transform .12s ease, box-shadow .14s;
}
.tab-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 8px 28px rgba(var(--accent-rgb), 0.12);
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(var(--accent-rgb), 0.22);
}
.auth-card {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-1);
  border: 1px solid rgba(2,6,23,0.04);
  margin-bottom: 12px;
}
.field { margin-bottom:12px }
.field label { display:block; font-size:0.9rem; margin-bottom:6px }
.field input { width:100%; padding:10px 12px; border:1px solid rgba(2,6,23,0.06); border-radius:10px; background: rgba(15,23,42,0.02); transition: box-shadow .14s, background .12s, transform .06s }
.field input:focus { outline: none; box-shadow: 0 8px 24px rgba(2,6,23,0.06); background: #fff }
.actions { margin-top:8px }
.btn-primary.btn-lg { padding:10px 16px; border-radius:10px; box-shadow: var(--shadow-1); transition: transform .12s cubic-bezier(.4,0,.2,1), box-shadow .14s, filter .12s }
.btn-primary.btn-lg:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); filter: brightness(1.02) }
.btn-primary.btn-lg:active { transform: translateY(1px); box-shadow: var(--shadow-1) }
.message { margin-top:12px; color:var(--muted) }
</style>
