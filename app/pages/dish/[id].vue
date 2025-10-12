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
        <img :src="dish.image" :alt="dish.name" class="hero-img" />
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

const dish = ref<Dish | null>(null);
const restaurant = ref<Rest | null>(null);
const more = ref<Dish[]>([]);

// Chargement des données : restaurants + map de plats (structure: { r1: [...], r2: [...] })
const { data: restData } = await useAsyncData("restaurants", () =>
  $fetch("/api/restaurants")
);
const { data: dishesMapData } = await useAsyncData("dishesMap", () =>
  $fetch("/api/dishes")
);

const rests = (restData.value || []) as Rest[];
const dishesMap = (dishesMapData.value || {}) as Record<string, Dish[]>;

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
dish.value = found ?? null;

if (foundRestaurantId) {
  restaurant.value =
    rests.find((r: Rest) => r.id === foundRestaurantId) ?? null;
  more.value = (dishesMap[foundRestaurantId] || []).filter(
    (x: Dish) => x.id !== id
  );
}

function formatPrice(p: any) {
  return typeof p === "number" ? p.toFixed(2) + " €" : p;
}
function addToCart() {
  // simple demo : on stocke dans localStorage un tableau "resto_cart"
  try {
    const raw = localStorage.getItem("resto_cart") || "[]";
    const arr = JSON.parse(raw);
    arr.push({
      id: dish.value?.id,
      name: dish.value?.name,
      price: dish.value?.price,
    });
    localStorage.setItem("resto_cart", JSON.stringify(arr));
    alert("Ajouter au panier ✓");
  } catch (e) {
    console.warn(e);
  }
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
