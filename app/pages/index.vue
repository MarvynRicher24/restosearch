<template>
  <div class="site-root">
    <section class="hero container">
      <div class="hero-inner">
        <h1 class="logo"><span>resto</span><strong>search</strong></h1>
        <p class="lead">Le meilleur resto à portée de main</p>

        <div class="search-wrap">
          <label for="restaurant-search" class="sr-only"
            >Rechercher un restaurant</label
          >
          <input
            id="restaurant-search"
            v-model="query"
            @input="onInput"
            placeholder="Rechercher votre resto"
            class="search-input"
            aria-label="Rechercher des restaurants"
          />
          <input
            id="restaurant-location"
            v-model="locationQuery"
            @input="onInput"
            placeholder="Localiser votre resto"
            class="search-input location"
            aria-label="Filtrer par localisation"
          />
          <button
            v-if="query"
            @click="clear"
            class="clear-btn"
            aria-label="Effacer la recherche"
          >
            ✕
          </button>
        </div>

        <div class="hero-meta">
          <div>{{ filtered.length }} résultats</div>
          <div class="controls">
            <select v-model="cuisineFilter">
              <option value="">Toutes cuisines</option>
              <option v-for="c in cuisines" :key="c" :value="c">{{ c }}</option>
            </select>

            <select v-model="sortBy">
              <option value="relevance">Pertinence</option>
              <option value="rating">Note décroissante</option>
              <option value="name">Nom A→Z</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="container results-grid">
      <div v-if="loading" class="loading">Chargement…</div>
      <div v-else-if="filtered.length === 0" class="empty">
        Aucun résultat pour « {{ query }} »
      </div>

      <div class="grid">
        <RestaurantCard v-for="r in paged" :key="r.id" :restaurant="r" />
      </div>

      <div class="pager" v-if="pages > 1">
        <button @click="prev" :disabled="page === 1">Préc</button>
        <span>Page {{ page }} / {{ pages }}</span>
        <button @click="next" :disabled="page === pages">Suiv</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
// Types locaux (on les redéfinit temporairement)
interface Restaurant {
  id: string;
  name: string;
  image: string;
  location: string;
  cuisine: string;
  rating?: number;
  short?: string;
}
import RestaurantCard from "~/components/RestaurantCard.vue";

// Configuration SEO
useHead({
  title: "RestoSearch - Trouvez votre restaurant idéal",
  meta: [
    {
      name: "description",
      content:
        "Recherchez et découvrez les meilleurs restaurants près de chez vous avec filtres par cuisine et localisation.",
    },
  ],
});

const query = ref<string>("");
const locationQuery = ref<string>("");
// debounced values used for filtering to avoid excessive re-evaluation while typing
const debouncedQuery = ref<string>("");
const debouncedLocation = ref<string>("");
const cuisineFilter = ref<string>("");
const sortBy = ref<"relevance" | "rating" | "name">("relevance");

const restaurants = ref<Restaurant[]>([]);
const loading = ref<boolean>(true);
const cuisines = ref<string[]>([]);

const page = ref<number>(1);
const perPage = 6;

// Chargement des restaurants (API côté serveur pour éviter la résolution par le routeur)
const { data } = await useAsyncData("restaurants", () =>
  $fetch("/api/restaurants")
);
restaurants.value = (data.value || []) as Restaurant[];

const setCuisines = () => {
  const set = new Set<string>();
  restaurants.value.forEach((r: Restaurant) => {
    if (r.cuisine) set.add(r.cuisine);
  });
  cuisines.value = Array.from(set).sort();
};
setCuisines();
loading.value = false;

const filtered = computed<Restaurant[]>(() => {
  const q = debouncedQuery.value.trim().toLowerCase();
  const locQ = debouncedLocation.value.trim().toLowerCase();
  let out = restaurants.value.filter((r: Restaurant) => {
    if (cuisineFilter.value && r.cuisine !== cuisineFilter.value) return false;
    // If a main query is provided, match against name, cuisine or short description
    if (q) {
      const matchMain =
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        (r.short && r.short.toLowerCase().includes(q));
      if (!matchMain) return false;
    }
    // If a location query is provided, match it against the restaurant location (city, street...) or postal if present
    if (locQ) {
      if (!r.location || !r.location.toLowerCase().includes(locQ)) return false;
    }
    // If neither query nor locationQuery provided, keep the restaurant
    return true;
  });

  if (sortBy.value === "rating")
    out = out
      .slice()
      .sort(
        (a: Restaurant, b: Restaurant) => (b.rating ?? 0) - (a.rating ?? 0)
      );
  if (sortBy.value === "name")
    out = out
      .slice()
      .sort((a: Restaurant, b: Restaurant) => a.name.localeCompare(b.name));
  return out;
});

const pages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / perPage))
);
const paged = computed(() => {
  const start = (page.value - 1) * perPage;
  return filtered.value.slice(start, start + perPage);
});

// Debounce: update debouncedQuery / debouncedLocation after typing stops
let __rs_query_timer: any = null
let __rs_location_timer: any = null
watch([query, locationQuery], () => {
  if (__rs_query_timer) clearTimeout(__rs_query_timer)
  __rs_query_timer = setTimeout(() => {
    debouncedQuery.value = query.value
  }, 300)
  if (__rs_location_timer) clearTimeout(__rs_location_timer)
  __rs_location_timer = setTimeout(() => {
    debouncedLocation.value = locationQuery.value
  }, 300)
})

watch([debouncedQuery, debouncedLocation, cuisineFilter, sortBy], () => {
  page.value = 1;
})

onBeforeUnmount(() => {
  if (__rs_query_timer) clearTimeout(__rs_query_timer)
  if (__rs_location_timer) clearTimeout(__rs_location_timer)
})

function next() {
  if (page.value < pages.value) page.value++;
}
function prev() {
  if (page.value > 1) page.value--;
}
function clear() {
  query.value = "";
  locationQuery.value = "";
  debouncedQuery.value = "";
  debouncedLocation.value = "";
}

function onInput() {
  // noop: debounce handled by watchers above
}
</script>

<style scoped src="~/assets/css/site.css"></style>
