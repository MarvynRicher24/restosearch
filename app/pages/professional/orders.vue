<template>
  <div class="container">
    <div class="orders-top">
      <button class="back" @click="goBack">← Mon profil</button>
      <h1>Mes commandes</h1>
    </div>

    <div class="empty">Vous n'avez aucune commande pour le moment.</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged } = useAuth()

onMounted(() => {
  if (!isLogged.value || user.value?.role !== 'professional') {
    router.push('/auth')
  }
})

function goBack() {
  router.push('/professional/dashboard')
}
</script>

<style scoped>
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
.empty { margin-top:12px }
</style>