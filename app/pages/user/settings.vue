<template>
  <div class="container settings-page">
    <button class="back" @click="goBack">← Mon profil</button>
    <h1>Paramètres du compte</h1>

    <div v-if="!user" class="muted">Chargement...</div>

    <form v-else @submit.prevent="save" class="settings-form">
      <label>
        Pseudo
        <input v-model="pseudo" type="text" placeholder="Votre pseudo" />
      </label>

      <label>
        Email
        <input v-model="email" type="email" placeholder="votre@exemple.com" />
      </label>

      <label>
        Nouveau mot de passe
        <input v-model="password" type="password" placeholder="Laisser vide pour ne pas changer" />
      </label>

      <label>
        Confirmer le mot de passe
        <input v-model="passwordConfirm" type="password" placeholder="Confirmer" />
      </label>

      <div class="actions">
        <button class="btn btn-secondary" type="button" @click="goBack">Annuler</button>
        <button class="btn btn-primary" type="submit">Enregistrer</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - runtime middleware key (string[]/string) is valid in Nuxt meta
definePageMeta({ middleware: ['auth'] })
import { ref, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import type { UserWithPassword } from '../../../types'
import { useRouter } from '#app'

const router = useRouter()
const { user, isLogged, token, setSession } = useAuth()

const pseudo = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

onMounted(() => {
  if (!isLogged.value) {
    router.push('/auth')
    return
  }
  // populate with current user
  pseudo.value = user.value?.name || ''
  email.value = user.value?.email || ''
})

function goBack() {
  router.push('/user/dashboard')
}

function save() {
  if (password.value && password.value !== passwordConfirm.value) {
    alert("Les mots de passe ne correspondent pas.")
    return
  }

  // build new user object, keep existing token
  const ensuredId = (user.value && user.value.id) ? user.value.id : `u${Date.now()}`
  const ensuredRole = (user.value && user.value.role) ? user.value.role : 'user'
  const newUser: UserWithPassword = {
    id: ensuredId,
    email: email.value,
    name: pseudo.value,
    role: ensuredRole,
    // preserve other optional fields if present
    ...(user.value || {}),
  }
  if (password.value) {
    // store password field if your fake auth uses it - otherwise ignore
    newUser.password = password.value
  }

  // update session (persists to localStorage via setSession)
  setSession(newUser, token.value || '')

  // feedback and return to dashboard
  alert('Informations enregistrées.')
  router.push('/user/dashboard')
}
</script>

<style scoped>
.settings-page { padding-top: 12px }
.settings-form { display:flex; flex-direction:column; gap:12px; max-width:520px }
label { display:flex; flex-direction:column; gap:6px }
input { padding:10px 12px; border-radius:8px; border:1px solid #e6eef8; background:#fff }
.actions { display:flex; gap:8px; justify-content:flex-end }
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
