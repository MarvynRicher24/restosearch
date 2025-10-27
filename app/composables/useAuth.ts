import { ref, computed, onMounted } from 'vue'

// Shared reactive state (singleton) so multiple calls to useAuth() share the same session
const user = ref<Record<string, any> | null>(null)
const token = ref<string | null>(null)
let initialized = false

function initFromStorage() {
  if (initialized) return
  initialized = true
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('resto_user')
    if (raw) user.value = JSON.parse(raw)
  } catch (e) {
    user.value = null
  }
  try {
    token.value = localStorage.getItem('resto_token')
  } catch (e) {
    token.value = null
  }
}

export function useAuth() {
  // ensure we read localStorage once on first use (also safe if called during setup)
  onMounted(() => initFromStorage())

  const isLogged = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => !!user.value && user.value.role === 'admin')

  function setSession(u: Record<string, any>, t: string) {
    user.value = u
    token.value = t
    try {
      localStorage.setItem('resto_user', JSON.stringify(u))
      localStorage.setItem('resto_token', t)
    } catch (e) {
      // ignore
    }
  }

  function logout() {
    user.value = null
    token.value = null
    try {
      localStorage.removeItem('resto_user')
      localStorage.removeItem('resto_token')
    } catch (e) {
      // ignore
    }
  }

  return {
    user,
    token,
    isLogged,
    isAdmin,
    setSession,
    logout
  }
}
