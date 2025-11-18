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
import { ref } from "vue";

type Rest = {
  id: string;
  name: string;
  image: string;
  location: string;
  cuisine: string;
  rating?: number;
  short?: string;
};
type Dish = { id: string; name: string; price: number; image: string };

const route = useRoute();
const router = useRouter();
const id = String(route.params.id || "");

const restaurant = ref<Rest | null>(null);
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

const { data: restData } = await useAsyncData("restaurants", () =>
  $fetch("/api/restaurants")
);
const { data: dishesMap } = await useAsyncData("dishesMap", () =>
  $fetch("/api/dishes")
);

const rests = (restData.value || []) as Rest[];
restaurant.value = rests.find((r: Rest) => r.id === id) ?? null;

const map = (dishesMap.value || {}) as Record<string, Dish[]>;
  dishes.value = map[id] ?? [];
  // also include any custom dishes created by professionals (ownerId === restaurant id)
  try {
    const custom = await $fetch('/api/professional/dishes_custom').catch(() => [])
    const arr = Array.isArray(custom) ? custom : []
    const extras = arr.filter((dd: any) => dd.ownerId === id)
    // merge, avoiding duplicates by id
    const existingIds = new Set(dishes.value.map((x: any) => x.id))
    for (const e of extras) {
      if (!existingIds.has(e.id)) dishes.value.push(e)
    }
  } catch (e) {
    // ignore
  }
function formatPrice(p: number) {
  return typeof p === "number" ? p.toFixed(2) + " €" : p;
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