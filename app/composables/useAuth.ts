// app/composables/useAuth.ts
import { ref, computed } from "vue";

interface AuthUser {
  email: string;
  createdAt?: number;
}

interface AuthResponse {
  email: string;
  token: string;
  error?: string;
}

export function useAuth() {
  const user = useState<AuthUser | null>("authUser", () => null);
  const token = useState<string | null>("authToken", () => null);
  const isLoading = ref(false);

  // Initialiser depuis localStorage côté client
  if (import.meta.client) {
    const storedToken = localStorage.getItem("resto_token");
    const storedUser = localStorage.getItem("resto_user");

    if (storedToken) token.value = storedToken;
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (error) {
        console.warn("Erreur parsing user depuis localStorage:", error);
        localStorage.removeItem("resto_user");
      }
    }
  }

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  async function login(email: string, password: string): Promise<void> {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email et mot de passe requis");
    }

    isLoading.value = true;
    try {
      const res = await $fetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });

      if (res.error) {
        throw new Error(res.error);
      }

      token.value = res.token;
      user.value = { email: res.email };

      if (import.meta.client) {
        localStorage.setItem("resto_token", res.token);
        localStorage.setItem("resto_user", JSON.stringify(user.value));
      }
    } catch (error: any) {
      const message =
        error?.data?.error || error?.message || "Erreur lors de la connexion";
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string): Promise<void> {
    if (!email?.trim() || !password?.trim()) {
      throw new Error("Email et mot de passe requis");
    }

    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    isLoading.value = true;
    try {
      const res = await $fetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });

      if (res.error) {
        throw new Error(res.error);
      }

      token.value = res.token;
      user.value = { email: res.email };

      if (import.meta.client) {
        localStorage.setItem("resto_token", res.token);
        localStorage.setItem("resto_user", JSON.stringify(user.value));
      }
    } catch (error: any) {
      const message =
        error?.data?.error || error?.message || "Erreur lors de l'inscription";
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;

    if (import.meta.client) {
      localStorage.removeItem("resto_token");
      localStorage.removeItem("resto_user");
    }

    // Redirection côté client uniquement
    if (import.meta.client) {
      navigateTo("/backoffice/login");
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isLoggedIn,
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
  };
}
