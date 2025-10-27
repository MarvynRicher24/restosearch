<template>
  <div class="toasts" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
      <div class="toast-body">{{ t.message }}</div>
      <button class="toast-close" @click="dismiss(t.id)">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toasts {
  position: fixed;
  right: 18px;
  bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1200;
}
.toast {
  min-width: 220px;
  max-width: 360px;
  padding: 12px 14px;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(2,6,23,0.15);
  color: #0f172a;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.toast.info { background: #f8fafc; border: 1px solid #e6eef8 }
.toast.success { background: #ecfdf5; border: 1px solid #bbf7d0 }
.toast.error { background: #fff1f2; border: 1px solid #fecaca }
.toast-body { margin-right: 8px; font-size: 0.95rem }
.toast-close { background: transparent; border: none; cursor: pointer; color: #475569 }
</style>
