<template>
  <div class="container details">
    <button type="button" class="back" @click="goBack">← Retour</button>

    <div v-if="!restaurant" class="loading">Restaurant introuvable.</div>
    <div v-else>
      <div class="top">
        <img :src="restaurant.image" :alt="restaurant.name" class="hero-img" />

        <div class="info">
          <h1>{{ restaurant.name }}</h1>
          <p class="muted">
            {{ restaurant.location }} • {{ restaurant.cuisine }}
          </p>
          <p class="lead">{{ restaurant.short }}</p>
          <div class="meta">⭐ {{ restaurant.rating }}</div>
        </div>
      </div>

      <section class="dishes">
        <h2>Plats populaires</h2>
        <div class="dish-grid">
          <article v-for="d in dishes" :key="d.id" class="dish-card">
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
        <div v-if="dishes.length === 0" class="muted">
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