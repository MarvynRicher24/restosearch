<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-accent">resto</span
          ><span class="brand-strong">search</span>
        </NuxtLink>

        <div class="header-actions">
          <div class="lang-switch">
            <NuxtLink to="/" class="lang">FR</NuxtLink>
            <NuxtLink to="/en" class="lang">EN</NuxtLink>
          </div>
          <template v-if="!isLogged">
            <NuxtLink to="/auth" class="btn-auth">Connexion / Inscription</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink :to="profileRoute" class="link">Mon profil</NuxtLink>
            <!-- Afficher le panier pour les utilisateurs standards (lien vers /user/cart) -->
            <template v-if="user?.role === 'user'">
              <div class="cart-wrapper" ref="cartRef" :class="{ 'is-open': dropdownOpen }" tabindex="0">
                <button type="button" class="cart-trigger" @click="toggleDropdown" :aria-expanded="dropdownOpen">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="10" cy="20" r="1" fill="currentColor" />
                    <circle cx="18" cy="20" r="1" fill="currentColor" />
                  </svg>
                  <span class="cart-trigger-label">Panier</span>
                  <span class="cart-badge">{{ count }}</span>
                </button>
                <div class="cart-dropdown" role="menu" aria-hidden="true">
                  <div v-if="lastItems.length === 0" class="dropdown-empty">Aucun article</div>
                  <ul v-else class="dropdown-list">
                    <li v-for="(it, idx) in lastItems" :key="idx" class="dropdown-item">
                      <div class="di-left">
                        <div class="di-thumb">
                          <img v-if="(it as any).image" :src="(it as any).image" alt="" class="dropdown-thumb" />
                          <div v-else class="dropdown-thumb placeholder"></div>
                        </div>
                        <div class="di-meta">
                          <div class="di-name">{{ it.name }}</div>
                          <div class="di-resto">{{ it.restaurant?.name || '-' }}</div>
                        </div>
                      </div>
                      <div class="di-right">
                        <div class="di-qty">x{{ it.qty || 1 }}</div>
                        <div class="di-price">{{ formatPrice((it.price || 0) * (it.qty || 1)) }}</div>
                      </div>
                    </li>
                  </ul>
                  <div class="dropdown-total">Total : <strong>{{ formatPrice(total) }}</strong></div>
                  <button class="btn small" @click.prevent="goToCart">Voir le panier</button>
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
import { computed, ref, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../composables/useAuth'
import { useCart } from '../composables/useCart'
const GlobalToast = defineAsyncComponent(() => import('../components/GlobalToast.vue'))

  const router = useRouter()
  const { user, isLogged } = useAuth()
  const { items, count, total } = useCart()

const dropdownOpen = ref(false)
const cartRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

const lastItems = computed(() => (items.value || []).slice(-3).reverse())

const profileRoute = computed(() => {
  if (!isLogged.value) return '/auth'
  const role = user.value?.role || ''
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'professional') return '/professional/dashboard'
  return '/user/dashboard'
})

function formatPrice(p: number | undefined) {
  return typeof p === 'number' ? p.toFixed(2) + ' €' : String(p ?? '-')
}

import { nextTick } from 'vue'

function toggleDropdown(e?: Event) {
  if (e?.preventDefault) e.preventDefault()
  dropdownOpen.value = !dropdownOpen.value
  // when opening, move focus into the dropdown; when closing, return focus to the trigger
  if (dropdownOpen.value) {
    nextTick(() => {
      const first = dropdownRef.value?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      try { first?.focus() } catch(e) {}
    })
  } else {
    nextTick(() => {
      const trigger = cartRef.value?.querySelector<HTMLElement>('.cart-trigger')
      try { trigger?.focus() } catch(e) {}
    })
  }
}

function goToCart(e?: Event) {
  if (e?.preventDefault) e?.preventDefault()
  dropdownOpen.value = false
  router.push('/user/cart')
}

function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (!cartRef.value) return
  if (!cartRef.value.contains(target)) {
    if (dropdownOpen.value) {
      dropdownOpen.value = false
      // return focus to trigger when closing due to outside click
      nextTick(() => {
        const trigger = cartRef.value?.querySelector<HTMLElement>('.cart-trigger')
        try { trigger?.focus() } catch(e) {}
      })
    }
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
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
.lang-switch { display:flex; gap:8px; align-items:center }
.lang { font-size:0.85rem; padding:6px 8px; border-radius:8px; text-decoration:none; color:var(--muted); border:1px solid transparent }
.lang:hover { background: rgba(15,23,42,0.03); border-color: rgba(15,23,42,0.04); color:var(--text) }
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
.cart-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15,23,42,0.06);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.95rem;
  transition: background .12s ease, box-shadow .12s ease, transform .06s ease;
}
.cart-trigger svg { opacity: 0.85 }
.cart-trigger:hover { background: rgba(15,23,42,0.03); box-shadow: 0 4px 10px rgba(2,6,23,0.04) }
.cart-trigger:active { transform: translateY(1px) }
.cart-trigger-label { display:none }
.cart-badge {
  display: inline-block;
  background: var(--accent);
  color: white;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 999px;
  margin-left: 2px;
}
.cart-dropdown {
  display: none;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 340px;
  background: var(--card-bg, #fff);
  color: var(--text);
  border: 1px solid rgba(15,23,42,0.06);
  box-shadow: 0 14px 40px rgba(2,6,23,0.08);
  border-radius: 12px;
  padding: 12px;
  z-index: 60;
}
.cart-wrapper.is-open .cart-dropdown { display: block }
.cart-wrapper.is-open .cart-dropdown { display: block }
.dropdown-total { padding: 8px 6px; text-align:right; border-top:1px solid rgba(15,23,42,0.03); margin-top:8px; font-weight:600 }
.dropdown-list { list-style: none; margin: 0; padding: 0; max-height: 260px; overflow: auto; }
.dropdown-item { display:flex; justify-content:space-between; padding:10px 8px; gap:12px; border-bottom: 1px solid rgba(15,23,42,0.03); align-items:center }
.dropdown-empty { padding: 16px; color: var(--muted); text-align:center }
.di-left { display:flex; gap:10px; align-items:center }
.di-thumb img, .dropdown-thumb { width:52px; height:52px; object-fit:cover; border-radius:8px }
.dropdown-thumb.placeholder { background:#f3f4f6; width:52px; height:52px; border-radius:8px }
.di-meta { display:flex; flex-direction:column }
.di-name { font-weight:600 }
.di-resto { color:var(--muted); font-size:0.85rem }
.di-right { text-align:right; min-width:86px }
.btn.small { display:block; margin: 10px auto 0; text-align:center; padding:8px 12px; border-radius:8px; border:none; background:var(--accent); color:#fff; cursor: pointer }
.btn.small:hover { opacity:0.95 }
.dropdown-total { padding: 8px 6px; text-align:right; border-top:1px solid rgba(15,23,42,0.03); margin-top:8px; font-weight:700 }
</style>
