<template>
  <article class="card">
    <div class="card-media">
      <img :src="props.restaurant.image" :alt="props.restaurant.name" loading="lazy" />
    </div>

    <div class="card-body">
      <h2 class="card-title">{{ props.restaurant.name }}</h2>
      <p class="muted">{{ props.restaurant.location }}</p>
      <p class="desc">{{ props.restaurant.short }}</p>

      <div class="card-footer">
        <NuxtLink :to="`/restaurant/${props.restaurant.id}`" class="view-btn">
          {{ props.viewLabel ?? 'Voir le resto' }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Restaurant } from '../../types'

const props = defineProps<{ restaurant: Restaurant; viewLabel?: string }>()
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
  background: var(--accent);
  color: #fff;
  border: none;
  font-weight: 700;
  box-shadow: var(--shadow-1);
}
.view-btn:focus-visible {
  outline: 3px solid rgba(var(--accent-rgb), 0.16);
  outline-offset: 3px;
}
.view-btn:hover {
  filter: brightness(0.95);
  transform: translateY(-2px) scale(1.02);
}
</style>
