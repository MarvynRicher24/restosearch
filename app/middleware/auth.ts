export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();

  // Côté serveur, on ne peut pas vérifier localStorage
  // Donc on laisse passer et on vérifiera côté client
  if (import.meta.server) {
    return;
  }

  // Côté client, vérification complète
  if (!isLoggedIn.value) {
    return navigateTo("/backoffice/login");
  }
});
