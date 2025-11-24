<template>
  <div class="site-root">
    <section class="hero container">
      <div class="hero-inner">
        <h1 class="logo"><span>resto</span><strong>search</strong></h1>
        <p class="lead">{{ $t('home.lead') }}</p>

        <div class="search-wrap">
          <label for="restaurant-search" class="sr-only"
            >Rechercher un restaurant</label
          >
          <input
            id="restaurant-search"
            v-model="query"
            @input="onInput"
            :placeholder="$t('search.placeholder.restaurant')"
            class="search-input"
            :aria-label="$t('search.aria.restaurantSearch')"
          />
          <input
            id="restaurant-location"
            v-model="locationQuery"
            @input="onInput"
            :placeholder="$t('search.placeholder.location')"
            class="search-input location"
            :aria-label="$t('search.aria.locationFilter')"
          />
          <button
            v-if="query"
            @click="clear"
            class="clear-btn"
            :aria-label="$t('search.aria.clear')"
          >
            ✕
          </button>
        </div>

          <div class="hero-meta">
          <div>{{ $t('home.results', { count: filtered.length }) }}</div>
          <div class="controls">
            <!-- Filtre par type de cuisine supprimé -->
            <label for="sort-by" class="sr-only">Trier par</label>
            <select id="sort-by" v-model="sortBy" :aria-label="$t('search.aria.sortBy')">
              <option value="relevance">{{ $t('search.sort.relevance') }}</option>
              <option value="rating">{{ $t('search.sort.rating') }}</option>
              <option value="name">{{ $t('search.sort.name') }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <section class="container results-grid">
      <div v-if="loading" class="loading">{{ $t('home.loading') }}</div>
      <div v-else-if="filtered.length === 0" class="empty">
        {{ $t('home.empty', { query }) }}
      </div>

      <div class="grid">
        <RestaurantCard v-for="r in paged" :key="r.id" :restaurant="r" />
      </div>

      <div class="pager" v-if="pages > 1">
        <button @click="prev" :disabled="page === 1">{{ $t('pager.prev') }}</button>
        <span>{{ $t('pager.page', { page: page, pages: pages }) }}</span>
        <button @click="next" :disabled="page === pages">{{ $t('pager.next') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { useI18n } from 'vue-i18n'
// Types importés depuis `types` pour un typage centralisé
import type { Restaurant } from '../../types'
import RestaurantCard from "~/components/RestaurantCard.vue";
import { apiFetch } from '~/services/api'

// Configuration SEO
import useSeo from '~/composables/useSeo'
const { t } = useI18n()

const seo = useSeo({
  title: t('seo.homeTitle'),
  description: t('seo.homeDescription'),
  image: '/og-image.png',
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RestoSearch',
    url: process.client ? window.location.href : '/',
  },
})

useHead({
  title: seo.title,
  meta: seo.meta,
  link: seo.link,
  script: seo.script,
})

const query = ref<string>("");
const locationQuery = ref<string>("");
// debounced values used for filtering to avoid excessive re-evaluation while typing
const debouncedQuery = ref<string>("");
const debouncedLocation = ref<string>("");
const sortBy = ref<"relevance" | "rating" | "name">("relevance");

const restaurants = ref<Restaurant[]>([]);
const loading = ref<boolean>(true);

const page = ref<number>(1);
const perPage = 6;

// Chargement des restaurants (API côté serveur pour éviter la résolution par le routeur)
const { data, error, refresh } = await useAsyncData<Restaurant[]>(
  "restaurants",
  () => apiFetch<Restaurant[]>('/api/restaurants'),
  { server: true, default: () => [] }
);
restaurants.value = (data.value || []) as Restaurant[];
if (error?.value) {
  // log serveur/console pour faciliter le debug ; UI peut lire `filtered.length === 0`
  console.error('Failed to load restaurants', error.value)
}

// Filtre par cuisine retiré — on conserve uniquement le tri et la recherche
loading.value = false;

const filtered = computed<Restaurant[]>(() => {
  const q = debouncedQuery.value.trim().toLowerCase();
  const locQ = debouncedLocation.value.trim().toLowerCase();
  let out = restaurants.value.filter((r: Restaurant) => {
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
let __rs_query_timer: ReturnType<typeof setTimeout> | null = null
let __rs_location_timer: ReturnType<typeof setTimeout> | null = null
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

watch([debouncedQuery, debouncedLocation, sortBy], () => {
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
