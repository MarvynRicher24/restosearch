<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md p-8 border rounded-lg bg-white">
      <h2 class="text-2xl font-semibold mb-4">Inscription</h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm">Mot de passe</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Création..." : "Créer mon compte" }}
          </button>
          <NuxtLink to="/backoffice/login" class="text-sm text-emerald-600"
            >J'ai déjà un compte</NuxtLink
          >
        </div>
      </form>

      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "#app";
import { useAuth } from "~/composables/useAuth";

// Configuration SEO
useHead({
  title: "Inscription - RestoSearch",
});

const { register, isLoading } = useAuth();
const router = useRouter();

const form = ref({ email: "", password: "" });
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (isLoading.value) return;

  error.value = null;
  try {
    await register(form.value.email, form.value.password);
    await router.push("/backoffice/dashboard");
  } catch (err: any) {
    error.value = err?.message || "Erreur lors de l'inscription";
  }
};
</script>
