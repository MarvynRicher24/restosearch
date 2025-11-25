<template>
  <div class="container details">
    <button type="button" class="back" @click="goBack">← Retour</button>

    <div v-if="!dish" class="loading">Plat introuvable.</div>

    <div v-else class="dish-detail">
      <div v-if="restaurant" class="resto-chip">
        <span>Restaurant:</span>
        <NuxtLink :to="`/restaurant/${restaurant.id}`" class="resto-link">{{
          restaurant.name
        }}</NuxtLink>
      </div>

      <div class="top">
        <img :src="dish.image" :alt="dish.name" class="hero-img" loading="lazy" />
        <div class="info">
          <h1>{{ dish.name }}</h1>
          <div class="d-price big">{{ formatPrice(dish.price) }}</div>
          <p class="lead" v-if="restaurant">{{ restaurant.short }}</p>

          <div class="actions">
            <button @click="addToCart" class="btn btn-primary">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>

      <section class="dishes">
        <h2>Autres plats de {{ restaurant?.name ?? "ce restaurant" }}</h2>
        <div class="dish-grid">
          <article v-for="d in more" :key="d.id" class="dish-card">
            <img class="dish-img" :src="d.image" :alt="d.name" loading="lazy" />
            <div class="dish-content">
              <h3 class="d-title">{{ d.name }}</h3>
              <div class="d-price">{{ formatPrice(d.price) }}</div>
            </div>
            <div class="dish-actions">
              <NuxtLink
                :to="`/dish/${d.id}`"
                class="btn btn-primary"
                :aria-label="`Voir le plat ${d.name}`"
              >
                Voir le plat
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
  <!-- Auth modal -->
  <div v-if="showAuthModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>Connexion requise</h3>
      <p>Vous devez être connecté pour ajouter des articles au panier.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="closeModal">Annuler</button>
        <button class="btn btn-primary" @click="goToAuth">Se connecter / S'inscrire</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from '#app'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'
import { useToast } from '../../composables/useToast'
import type { Restaurant, Dish } from '../../../types'

import { apiFetch } from '~/services/api'

const route = useRoute();
const router = useRouter();
const id = String(route.params.id || "");

const dish = ref<Dish | null>(null);
const restaurant = ref<Restaurant | null>(null);
const more = ref<Dish[]>([]);
const showAuthModal = ref(false)
const { isLogged } = useAuth()

// Chargement des données : restaurants + map de plats (structure: { r1: [...], r2: [...] })
const { data: restData, error: restError } = await useAsyncData<Restaurant[]>("restaurants", () =>
  apiFetch<Restaurant[]>('/api/restaurants'),
  { server: true, default: () => [] }
);
const { data: dishesMapData, error: dishesError } = await useAsyncData<Record<string, Dish[]>>("dishesMap", () =>
  apiFetch<Record<string, Dish[]>>('/api/dishes'),
  { server: true, default: () => ({}) }
);

const rests = (restData?.value || []) as Restaurant[];
if (restError?.value) {
  console.error('Failed to load restaurants', restError.value)
  try { if (process.client) useToast().show('Erreur lors du chargement des restaurants', 'error') } catch(e) {}
}
if (dishesError?.value) {
  console.error('Failed to load dishes map', dishesError.value)
  try { if (process.client) useToast().show('Erreur lors du chargement des plats', 'error') } catch(e) {}
}
// Normalize dishes response: API may return either a Record<string, Dish[]> map
// or a flat Dish[] array (historic data). Normalize to a map keyed by ownerId.
const _dishesRaw = dishesMapData?.value ?? {};
let dishesMap: Record<string, Dish[]> = {};
if (Array.isArray(_dishesRaw)) {
  for (const d of _dishesRaw as Dish[]) {
    const key = (d as any).ownerId || (d as any).restaurantId || 'unknown';
    if (!dishesMap[key]) dishesMap[key] = [];
    dishesMap[key].push(d);
  }
} else {
  dishesMap = _dishesRaw as Record<string, Dish[]>;
}
if (restError?.value) console.error('Failed to load restaurants', restError.value)
if (dishesError?.value) console.error('Failed to load dishes map', dishesError.value)

// Cherche le plat dans la map
let found: Dish | undefined = undefined;
let foundRestaurantId: string | undefined = undefined;
for (const [rid, arr] of Object.entries(dishesMap)) {
  const f = (arr || []).find((x: Dish) => x.id === id);
  if (f) {
    found = f;
    foundRestaurantId = rid;
    break;
  }
}

// if not found in standard map, look into professional custom dishes (server) then localStorage
if (!found) {
  try {
    const custom = await apiFetch<Dish[]>('/api/professional/dishes_custom')
    const arr = Array.isArray(custom) ? custom : []
      const f = arr.find((d) => d && d.id === id)
      if (f) {
        found = f
        foundRestaurantId = f.ownerId
      }
  } catch (e) {
    console.error('Failed to load professional custom dishes', e)
  }
}

if (!found) {
  try {
    if (process.client) {
      const raw = localStorage.getItem('resto_dishes_custom') || '[]'
      const arr = JSON.parse(raw || '[]')
      if (Array.isArray(arr)) {
        const f = (arr as Dish[]).find((d) => d && d.id === id)
        if (f) {
          found = f
          foundRestaurantId = f.ownerId
        }
      }
    }
  } catch (e) {
    console.warn('Failed to read local custom dishes', e)
  }
}

dish.value = found ?? null;

if (foundRestaurantId) {
  restaurant.value = rests.find((r: Restaurant) => r.id === foundRestaurantId) ?? null;
  more.value = (dishesMap[foundRestaurantId] || []).filter(
    (x: Dish) => x.id !== id
  );
  // also add custom dishes from professional list to "more"
  try {
    const custom = await apiFetch<Dish[]>('/api/professional/dishes_custom')
    const arr = Array.isArray(custom) ? custom : []
    const extras = arr.filter((dd) => dd && dd.ownerId === foundRestaurantId && dd.id !== id)
    const existing = new Set(more.value.map((m: Dish) => m.id))
    for (const e of extras) if (!existing.has(e.id)) more.value.push(e)
  } catch (e) {
    console.error('Failed to load professional custom dishes', e)
  }
}

// SEO: utiliser le composable centralisé pour générer title/meta/og/twitter/json-ld
import useSeo from '~/composables/useSeo'

const seoInput = computed(() => {
  const d = dish.value
  const r = restaurant.value
  const title = d ? `${d.name} — RestoSearch` : 'Plat — RestoSearch'
  const descriptionRaw = d?.description || r?.short || ''
  const description = descriptionRaw ? descriptionRaw.slice(0, 160) : ''

  const jsonld = d
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: d.name,
        image: d.image || undefined,
        description: description || undefined,
        offers:
          d.price != null
            ? { '@type': 'Offer', price: String(d.price), priceCurrency: 'EUR' }
            : undefined,
      }
    : null

  return {
    title,
    description,
    image: d?.image || r?.image || undefined,
    jsonld,
    url: process.client ? window.location.href : undefined,
  }
})

let seo = useSeo(seoInput.value)
useHead({
  title: seo.title,
  meta: seo.meta,
  link: seo.link,
  script: seo.script,
})

watch(seoInput, (v) => {
  seo = useSeo(v)
  useHead({
    title: seo.title,
    meta: seo.meta,
    link: seo.link,
    script: seo.script,
  })
})

function formatPrice(p: number | undefined) {
  return typeof p === "number" ? p.toFixed(2) + " €" : String(p ?? "-");
}
function addToCart() {
  // si non connecté, ouvrir modal invitant à se connecter
  if (!isLogged.value) {
    showAuthModal.value = true
    return
  }

  // si connecté, ajouter via useCart pour avoir un panier par utilisateur
  try {
    const { add } = useCart()
    add({
      id: dish.value?.id,
      name: dish.value?.name,
      price: dish.value?.price,
      image: dish.value?.image,
      restaurant: { id: restaurant.value?.id, name: restaurant.value?.name }
    })
  // petit feedback utilisateur via toast
  const toast = useToast()
  toast.show('Plat ajouté au panier ✓', 'success')
  } catch (e) {
    console.warn(e)
  }
}

function goToAuth() {
  // sauvegarder l'action en attente pour l'ajouter après connexion
  try {
    const pending = {
      item: {
        id: dish.value?.id,
        name: dish.value?.name,
        price: dish.value?.price,
        image: dish.value?.image,
        restaurant: { id: restaurant.value?.id, name: restaurant.value?.name }
      },
      returnPath: process.client ? window.location.pathname : '/'
    }
    localStorage.setItem('resto_pending_add', JSON.stringify(pending))
  } catch (e) {
    console.warn('Impossible de sauvegarder l\'action en attente', e)
  }
  showAuthModal.value = false
  router.push('/auth')
}

function closeModal() {
  showAuthModal.value = false
}

function goBack() {
  if (process.client && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>

<style scoped src="~/assets/css/site.css"></style>

<style scoped>
/* s'assurer que les boutons ont bien le curseur pointer */
.btn { cursor: pointer }

/* modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
}
.modal {
  background: white;
  padding: 18px;
  border-radius: 8px;
  width: min(520px, calc(100% - 48px));
  box-shadow: 0 8px 30px rgba(2,6,23,0.2);
}
.modal h3 { margin: 0 0 8px }
.modal p { margin: 0 0 14px; color: var(--muted) }
.modal-actions { display:flex; gap:12px; justify-content:flex-end }
.btn-secondary { background: #f3f4f6; color: #111827; border: 1px solid #e5e7eb }
.btn-primary { background: var(--accent); color: white; border: none }
</style>
