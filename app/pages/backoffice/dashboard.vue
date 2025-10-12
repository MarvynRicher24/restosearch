<template>
<div class="min-h-screen p-8">
<header class="flex justify-between items-center mb-8">
<h1 class="text-3xl font-bold">Back office — Dashboard</h1>
<div>
<span class="mr-4">{{ user?.email }}</span>
<button @click="logout" class="px-3 py-1 border rounded">Logout</button>
</div>
</header>


<section>
<p>Bienvenue sur le dashboard protégé. C'est ici que vous implémenterez vos outils d'administration.</p>
</section>
</div>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'


// Require auth for this page
definePageMeta({ middleware: 'auth' })


const { user, logout } = useAuth()


// optional: refresh or check user on mount
onMounted(() => {})
</script>