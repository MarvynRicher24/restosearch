<template>
  <div class="container">
    <h1 class="title">Espace professionnel</h1>
    <p v-if="!user">Vérification en cours...</p>

    <div v-else class="main">
      <div class="header">
        <div>
          <p class="welcome">Bonjour, <strong>{{ user.name }}</strong></p>
          <p class="email">{{ user.email }} — <em>{{ user.role }}</em></p>
        </div>
        <div>
          <button class="logout" @click="doLogout">Se déconnecter</button>
        </div>
      </div>

      <section class="controls">
        <p class="subtitle">Outils professionnels</p>
        <div class="cards">
          <div class="card" role="button" tabindex="0" @click="goToOrders" @keydown.enter="goToOrders">Mes commandes</div>
          <div class="card" role="button" tabindex="0" @click="goToDishes" @keydown.enter="goToDishes">Mes plats</div>
          <div class="card" role="button" tabindex="0" @click="goToSettings" @keydown.enter="goToSettings">Mon restaurant</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged, logout } = useAuth()

onMounted(() => {
  if (!isLogged.value) {
    router.push('/auth')
    return
  }
  if (user.value?.role !== 'professional') {
    router.push('/auth')
    return
  }
})

function doLogout() {
  logout()
  router.push('/')
}

function goToSettings() {
  router.push('/professional/settings')
}

function goToOrders() {
  router.push('/professional/orders')
}

function goToDishes() {
  router.push('/professional/dishes')
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
.card { background:#fff; border:1px solid #e5e7eb; padding:16px; border-radius:8px; box-shadow:0 1px 2px rgba(0,0,0,0.03); transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease }
.card[role="button"] { cursor: pointer }
.card[role="button"]:hover { transform: translateY(-4px); box-shadow: 0 6px 18px rgba(2,6,23,0.08); border-color: var(--accent) }
.card[role="button"]:active { transform: translateY(-2px) }
.logout { padding:8px 12px; background:#0ea5a4; color:white; border:none; border-radius:6px; cursor:pointer }
</style>
