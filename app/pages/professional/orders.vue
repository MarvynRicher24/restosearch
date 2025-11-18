<template>
  <div class="container">
    <button class="back" @click="goBack">← Mon profil</button>
    <h1 class="title">Commandes (Professionnel)</h1>
    <p class="muted">Page temporaire — pas d'interface de commandes personnalisée pour le moment.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { isLogged, user } = useAuth()

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
.title { margin-bottom: 8px }
.back { display:inline-flex; align-items:center; gap:8px; margin:12px 0 }
.muted { color:var(--muted) }
</style>
