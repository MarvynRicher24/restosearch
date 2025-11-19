export default defineNuxtRouteMiddleware((to) => {
  // Middleware client-side only: vérifie la présence d'un token dans localStorage
  if (process.server) return
  try {
    const t = localStorage.getItem('resto_token')
    if (!t) return navigateTo('/auth')
  } catch (e) {
    return navigateTo('/auth')
  }
})
