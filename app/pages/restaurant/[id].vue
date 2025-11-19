<template>
  <div class="container details">
    <button type="button" class="back" @click="goBack">← Retour</button>

    <div v-if="!restaurant" class="loading">Restaurant introuvable.</div>
    <div v-else>
      <div class="top">
        <img :src="restaurant.image" :alt="restaurant.name" class="hero-img" />

        <div class="info">
          <h1>{{ restaurant.name }}</h1>
          <p class="muted">{{ restaurant.location }}</p>
          <p class="lead">{{ restaurant.short }}</p>
          
        </div>
      </div>

      <section class="dishes">
        <h2>Plats du restaurant</h2>

        <div class="dishes-controls">
          <input
            v-model="searchTerm"
            class="search-input"
            placeholder="Rechercher un plat..."
            aria-label="Rechercher un plat"
          />
        </div>

        <div class="dish-grid">
          <article v-for="d in filteredDishes" :key="d.id" class="dish-card">
            <img class="dish-img" :src="d.image" :alt="d.name" />
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
        <div v-if="filteredDishes.length === 0" class="muted">
          Aucun plat trouvé pour ce restaurant.
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import useSeo from '~/composables/useSeo'
import type { Restaurant, Dish } from '../../../types'

import { apiFetch } from '~/services/api'

const route = useRoute();
const router = useRouter();
const id = String(route.params.id || "");

const restaurant = ref<Restaurant | null>(null);
const dishes = ref<Dish[]>([]);
const searchTerm = ref("");
const debounced = ref("");
let timer: ReturnType<typeof setTimeout> | null = null;

// debounce searchTerm into debounced (300ms)
watch(searchTerm, (v) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => (debounced.value = v.trim()), 300);
});

const filteredDishes = computed(() => {
  if (!debounced.value) return dishes.value;
  const q = debounced.value.toLowerCase();
  return dishes.value.filter((d) => d.name.toLowerCase().includes(q));
});

const { data: restData, error: restError } = await useAsyncData<Restaurant[]>("restaurants", () =>
  apiFetch<Restaurant[]>('/api/restaurants'),
  { server: true, default: () => [] }
);
const { data: dishesMap, error: dishesError } = await useAsyncData<Record<string, Dish[]>>("dishesMap", () =>
  apiFetch<Record<string, Dish[]>>('/api/dishes'),
  { server: true, default: () => ({}) }
);

const rests = (restData?.value || []) as Restaurant[];
if (restError?.value) console.error('Failed to load restaurants', restError.value)
if (dishesError?.value) console.error('Failed to load dishes map', dishesError.value)
restaurant.value = rests.find((r: Restaurant) => r.id === id) ?? null;

const map = (dishesMap.value || {}) as Record<string, Dish[]>;
  dishes.value = map[id] ?? [];
  // also include any custom dishes created by professionals (ownerId === restaurant id)
  try {
    const custom = await apiFetch<Dish[]>('/api/professional/dishes_custom')
    const arr = Array.isArray(custom) ? custom : []
    const extras = arr.filter((dd) => dd && dd.ownerId === id)
    // merge, avoiding duplicates by id
    const existingIds = new Set(dishes.value.map((x: Dish) => x.id))
    for (const e of extras) {
      if (!existingIds.has(e.id)) dishes.value.push(e)
    }
  } catch (e) {
    console.error('Failed to load professional custom dishes', e)
  }

// SEO dynamic
const seoInput = computed(() => {
  const r = restaurant.value
  const title = r ? `${r.name} — RestoSearch` : 'Restaurant — RestoSearch'
  const descriptionRaw = r?.short || ''
  const description = descriptionRaw ? descriptionRaw.slice(0, 160) : ''
  const jsonld = r
    ? {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: r.name,
        image: r.image || undefined,
        description: description || undefined,
        address: r.location || undefined,
      }
    : null
  return {
    title,
    description,
    image: r?.image || undefined,
    jsonld,
    url: process.client ? window.location.href : undefined,
  }
})

useHead(() => useSeo(seoInput.value))
function formatPrice(p: number | undefined) {
  return typeof p === "number" ? p.toFixed(2) + " €" : String(p ?? "-");
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