<template>
  <div class="container">
    <button class="back" @click="goBack">← Retour</button>
    <h1 class="title">Modifier le plat</h1>

    <div v-if="!loaded" class="loading">Chargement...</div>

    <div v-else class="auth-card">
      <form @submit.prevent="submit">
        <div class="field">
          <label>Nom</label>
          <input v-model="name" type="text" required />
        </div>

        <div class="field">
          <label>Prix (€)</label>
          <input v-model.number="price" type="number" step="0.01" required />
        </div>

        <div class="field">
          <label>Description (une phrase)</label>
          <input v-model="description" type="text" maxlength="200" placeholder="Une courte phrase (max 200 caractères)" />
        </div>

        <div class="field">
          <label>Importer une photo (webp ou jpeg)</label>
          <input ref="fileInput" @change="onFileChange" type="file" accept="image/webp,image/jpeg" />
          <div v-if="preview" class="preview"><img :src="preview" alt="aperçu" style="max-width:320px;border-radius:8px"/></div>
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary btn-lg">Enregistrer</button>
          <button type="button" class="btn subtle" @click="cancel" style="margin-left:8px">Annuler</button>
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
import type { Dish } from '../../../../types'

const router = useRouter()
const route = useRoute()
const { user, isLogged } = useAuth()

const id = String(route.params.id || '')

const loaded = ref(false)
const name = ref('')
const price = ref<number | null>(null)
const description = ref('')
const preview = ref<string | null>(null)
const imageData = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const message = ref('')

onMounted(async () => {
  if (!isLogged.value || user.value?.role !== 'professional') {
    router.push('/auth')
    return
  }

  // try to load dish from server custom list
  try {
    const server = await $fetch('/api/professional/dishes_custom').catch(() => null)
    const arr = Array.isArray(server) ? server : []
    const found = arr.find((d: Dish) => d.id === id)
    if (found) {
      populate(found)
      loaded.value = true
      return
    }
  } catch (e) {}

  // fallback to localStorage
  try {
    const raw = localStorage.getItem('resto_dishes_custom') || '[]'
    const arr = JSON.parse(raw || '[]')
    if (Array.isArray(arr)) {
      const found = arr.find((d: Dish) => d.id === id)
      if (found) {
        populate(found)
      }
    }
  } catch (e) {}
  loaded.value = true
})

function populate(d: Dish) {
  name.value = d.name || ''
  price.value = d.price || null
  description.value = d.description || ''
  preview.value = d.image || null
  imageData.value = d.image || null
}

function goBack() {
  router.push('/professional/dishes')
}

function cancel() {
  router.push('/professional/dishes')
}

async function onFileChange() {
  const el = fileInput.value
  const f = el?.files?.[0]
  if (!f) return
  const allowed = ['image/webp', 'image/jpeg']
  if (!allowed.includes(f.type)) {
    message.value = 'Format non supporté — utilisez webp ou jpeg.'
    return
  }
  try {
    const resized = await resizeImageFile(f, 1024, 1024, 0.8)
    preview.value = resized
    imageData.value = resized
  } catch (err) {
    message.value = 'Impossible de traiter l\'image.'
  }
}

async function resizeImageFile(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read error'))
    reader.readAsDataURL(file)
  })

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image load error'))
    image.src = dataUrl
  })

  const ratio = Math.min(1, maxWidth / img.width, maxHeight / img.height)
  const targetW = Math.max(1, Math.round(img.width * ratio))
  const targetH = Math.max(1, Math.round(img.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context not available')
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const outType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
  return canvas.toDataURL(outType, quality)
}

async function submit() {
  message.value = ''
  if (!name.value || price.value === null || isNaN(Number(price.value))) {
    message.value = 'Veuillez remplir le nom et le prix.'
    return
  }
  if (description.value && description.value.length > 200) {
    message.value = 'La description est trop longue (200 caractères max).'
    return
  }

  // build updated object
  const updated: Dish = {
    id,
    name: name.value,
    price: Number(price.value),
    description: description.value || '',
    image: imageData.value || ''
  }

  // try server update (use fetch to avoid $fetch method typing issues)
  try {
    try {
      await fetch('/api/professional/dishes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
      message.value = 'Modifications enregistrées sur le serveur.'
    } catch (e) {
      // ignore server error and fallback to local
    }

    // local fallback: update localStorage
    try {
      const raw = localStorage.getItem('resto_dishes_custom') || '[]'
      const arr = JSON.parse(raw || '[]')
      if (Array.isArray(arr)) {
        const idx = arr.findIndex((it: Dish) => it.id === id)
        if (idx !== -1) arr[idx] = { ...arr[idx], ...updated }
        else arr.push(updated)
        localStorage.setItem('resto_dishes_custom', JSON.stringify(arr))
      } else {
        localStorage.setItem('resto_dishes_custom', JSON.stringify([updated]))
      }
    } catch (e) {}

    router.push('/professional/dishes')
  } catch (e) {
    message.value = 'Erreur lors de la sauvegarde.'
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
</style>
