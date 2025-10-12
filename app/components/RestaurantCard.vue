<template>
  <article class="card">
    <div class="card-media">
      <img :src="props.restaurant.image" :alt="props.restaurant.name" />
      <div class="badge">{{ props.restaurant.cuisine }}</div>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ props.restaurant.name }}</h3>
      <p class="muted">{{ props.restaurant.location }}</p>
      <p class="desc">{{ props.restaurant.short }}</p>

      <div class="card-footer">
        <div class="rating">⭐ {{ props.restaurant.rating ?? "—" }}</div>
        <NuxtLink :to="`/restaurant/${props.restaurant.id}`" class="view-btn"
          >Voir le resto</NuxtLink
        >
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Restaurant {
  id: string;
  name: string;
  image: string;
  location: string;
  cuisine: string;
  rating?: number;
  short?: string;
}

interface Props {
  restaurant: Restaurant;
}

const props = defineProps<Props>();
</script>

<style scoped>
.card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-1);
  transition: transform 0.18s, box-shadow 0.18s;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-2);
}
.card-media {
  position: relative;
  height: 180px;
  overflow: hidden;
}
.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.badge {
  position: absolute;
  left: 12px;
  top: 12px;
  background: var(--accent);
  color: #fff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}
.card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.card-title {
  margin: 0;
  font-size: 1.05rem;
}
.muted {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0;
}
.desc {
  flex: 1;
  color: #374151;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.view-btn {
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-weight: 700;
}
</style>
