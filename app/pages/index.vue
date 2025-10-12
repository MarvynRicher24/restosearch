<template>
  <div class="site-root">
    <section class="hero container">
      <div class="hero-inner">
        <h1 class="logo"><span>resto</span><strong>search</strong></h1>
        <p class="lead">Trouvez un restaurant près de vous</p>

        <div class="search-wrap">
          <label for="restaurant-search" class="sr-only"
            >Rechercher un restaurant</label
          >
          <input
            id="restaurant-search"
            v-model="query"
            @input="onInput"
            placeholder="Rechercher un restaurant, ex: sushi, Paris..."
            class="search-input"
            aria-label="Rechercher des restaurants"
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
import { ref, computed, watch } from "vue";
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
  const q = query.value.trim().toLowerCase();
  let out = restaurants.value.filter((r: Restaurant) => {
    if (cuisineFilter.value && r.cuisine !== cuisineFilter.value) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      (r.short && r.short.toLowerCase().includes(q))
    );
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

watch([query, cuisineFilter, sortBy], () => {
  page.value = 1;
});

function next() {
  if (page.value < pages.value) page.value++;
}
function prev() {
  if (page.value > 1) page.value--;
}
function clear() {
  query.value = "";
}

let inputTimer: any = null;
function onInput() {
  clearTimeout(inputTimer);
  inputTimer = setTimeout(() => {
    // ici on ne touche pas à l'URL — la recherche filtre localement
  }, 150);
}
</script>

<style scoped src="~/assets/css/site.css"></style>
