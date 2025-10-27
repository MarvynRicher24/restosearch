<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-accent">resto</span
          ><span class="brand-strong">search</span>
        </NuxtLink>

        <div class="header-actions">
          <template v-if="!isLogged">
            <NuxtLink to="/auth" class="link">Connexion / Inscription</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink :to="profileRoute" class="link">Mon profil</NuxtLink>
            <!-- Afficher le panier pour les utilisateurs standards (lien vers /user/cart) -->
            <template v-if="user?.role === 'user'">
              <div class="cart-wrapper">
                <NuxtLink to="/user/cart" class="link cart-link">Panier <span class="cart-badge">{{ count }}</span></NuxtLink>
                <div class="cart-dropdown" role="menu" aria-hidden="true">
                  <div v-if="lastItems.length === 0" class="dropdown-empty">Aucun article</div>
                  <ul v-else class="dropdown-list">
                    <li v-for="(it, idx) in lastItems" :key="idx" class="dropdown-item">
                      <div class="di-left">
                        <div class="di-name">{{ it.name }}</div>
                        <div class="di-resto">{{ it.restaurant?.name || '-' }}</div>
                      </div>
                      <div class="di-right">
                        <div class="di-qty">x{{ it.qty || 1 }}</div>
                        <div class="di-price">{{ formatPrice((it.price || 0) * (it.qty || 1)) }}</div>
                      </div>
                    </li>
                  </ul>
                  <NuxtLink to="/user/cart" class="btn small">Voir le panier</NuxtLink>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </header>

    <!-- Global toast container -->
    <GlobalToast />

    <main class="main-content">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="container">
        © {{ new Date().getFullYear() }} — restosearch
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
import GlobalToast from '../components/GlobalToast.vue'

const { user, isLogged } = useAuth()
const { count } = useCart()

const { items } = useCart()

const lastItems = computed(() => (items.value || []).slice(-3).reverse())

const profileRoute = computed(() => {
  if (!isLogged.value) return '/auth'
  const role = user.value?.role || ''
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'professional') return '/professional/dashboard'
  return '/user/dashboard'
})

function formatPrice(p: any) {
  return typeof p === 'number' ? p.toFixed(2) + ' €' : p
}
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}
.site-header {
  backdrop-filter: saturate(120%) blur(6px);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.6)
  );
  border-bottom: 1px solid rgba(15, 23, 42, 0.04);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}
.brand {
  font-weight: 800;
  font-size: 1.35rem;
  text-decoration: none;
  color: var(--text);
}
.brand-accent {
  color: var(--accent);
}
.brand-strong {
  margin-left: 6px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.link {
  font-size: 0.95rem;
  color: var(--muted);
  text-decoration: none;
}
.cart-badge {
  display: inline-block;
  background: var(--accent);
  color: white;
  font-size: 0.75rem;
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 6px;
}
.main-content {
  min-height: 70vh;
  padding: 28px 0;
}
.site-footer {
  padding: 18px 0;
  border-top: 1px solid rgba(15, 23, 42, 0.03);
  color: var(--muted);
  font-size: 0.9rem;
  text-align: center;
}

/* Cart dropdown: hidden by default, shown on hover or focus */
.cart-wrapper {
  position: relative;
}
.cart-link {
  position: relative;
}
.cart-dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  background: var(--card-bg, #fff);
  color: var(--text);
  border: 1px solid rgba(15,23,42,0.06);
  box-shadow: 0 8px 20px rgba(2,6,23,0.08);
  border-radius: 8px;
  padding: 10px;
  z-index: 60;
}
.cart-wrapper:hover .cart-dropdown,
.cart-wrapper:focus-within .cart-dropdown {
  display: block;
}
.dropdown-list { list-style: none; margin: 0; padding: 0; max-height: 240px; overflow: auto; }
.dropdown-item { display:flex; justify-content:space-between; padding:8px 6px; border-bottom: 1px solid rgba(15,23,42,0.03); }
.dropdown-empty { padding: 12px; color: var(--muted); text-align:center }
.btn.small { display:block; margin: 8px auto 0; text-align:center }
</style>
