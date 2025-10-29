<template>
  <div class="container">
      <button class="back" @click="goBack">← Mon profil</button>
      <h1 class="title">Créer un plat</h1>

    <div class="auth-card">
      <form @submit.prevent="submit">
        <div class="field">
          <label>Nom</label>
          <input v-model="name" type="text" required />
        </div>

        <div class="field">
          <label>Photo (URL)</label>
          <input v-model="image" type="text" placeholder="https://..." />
        </div>

        <div class="field">
          <label>Prix (€)</label>
          <input v-model="price" type="number" step="0.01" required />
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary btn-lg">Créer le plat</button>
        </div>
      </form>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged } = useAuth()

const name = ref('')
const image = ref('')
const price = ref<number | null>(null)
const message = ref('')

onMounted(() => {
  if (!isLogged.value || user.value?.role !== 'professional') {
    router.push('/auth')
    return
  }
})

function goBack() {
  router.push('/professional/dishes')
}

function submit() {
  message.value = ''
  if (!name.value || price.value === null || isNaN(Number(price.value))) {
    message.value = 'Veuillez remplir le nom et le prix.'
    return
  }

  const ownerKey = user.value?.id || user.value?.email || null
  if (!ownerKey) {
    message.value = 'Utilisateur introuvable.'
    return
  }

  const newDish = {
    id: `d${Date.now()}`,
    name: name.value,
    price: Number(price.value),
    image: image.value || '',
    ownerId: ownerKey,
    createdAt: Date.now()
  }

  try {
    const raw = localStorage.getItem('resto_dishes_custom') || '[]'
    const arr = JSON.parse(raw || '[]')
    if (Array.isArray(arr)) {
      arr.push(newDish)
      localStorage.setItem('resto_dishes_custom', JSON.stringify(arr))
    } else {
      localStorage.setItem('resto_dishes_custom', JSON.stringify([newDish]))
    }
    message.value = 'Plat créé.'
    // redirect to dishes list
    router.push('/professional/dishes')
  } catch (e) {
    message.value = 'Impossible de sauvegarder le plat.'
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
.btn-primary.btn-lg { padding:10px 16px; border-radius:10px; box-shadow: var(--shadow-1); transition: transform .12s ease, box-shadow .14s, filter .12s }
.btn-primary.btn-lg:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); filter: brightness(1.02) }
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
</style>
