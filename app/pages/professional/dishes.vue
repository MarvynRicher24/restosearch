<template>
	<div class="container">
			<button class="back" @click="goBack">← Mon profil</button>
			<h1 class="title">Mes plats</h1>

		<p>Liste des plats (page professionnelle)</p>

    <div class="actions">
      <button class="btn btn-primary" @click="goCreate">Ajouter un plat</button>
    </div>

    <div v-if="dishes.length === 0" class="empty">Vous n'avez créé aucun plat pour le moment.</div>

    <div v-else class="dish-list">
      <article v-for="d in dishes" :key="d.id" class="dish-card">
        <img v-if="d.image" :src="d.image" alt="" class="dish-img" />
        <div class="dish-body">
          <strong class="dish-name">{{ d.name }}</strong>
          <div class="muted">{{ formatPrice(d.price) }}</div>
        </div>
        <div class="dish-actions">
          <button class="btn btn-danger" @click="openConfirm(d)">Supprimer</button>
        </div>
      </article>
    </div>

    <!-- Confirmation modal (reuse admin style) -->
    <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
        <h3>Supprimer le plat</h3>
        <div class="modal-body">
          <div class="modal-icon">⚠️</div>
          <div class="modal-text">
            <p class="modal-desc">Voulez‑vous vraiment supprimer <strong>{{ selectedDish?.name }}</strong> ?</p>
            <p class="muted small">Cette action est irréversible et supprimera le plat localement.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button ref="cancelBtn" class="btn subtle" @click="cancelDelete">Annuler</button>
          <button ref="confirmBtn" class="btn danger" @click="doDeleteConfirmed">Supprimer</button>
        </div>
      </div>
    </div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged } = useAuth()

const dishes = ref<Array<Record<string, any>>>([])

// modal state for delete confirmation
const showConfirm = ref(false)
const selectedDish = ref<Record<string, any> | null>(null)
const confirmBtn = ref<HTMLButtonElement | null>(null)
const cancelBtn = ref<HTMLButtonElement | null>(null)

function lockBodyScroll(lock: boolean) {
  try {
    if (lock) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  } catch (e) {}
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cancelDelete()
}

watch(showConfirm, async (val) => {
  if (val) {
    lockBodyScroll(true)
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    if (confirmBtn.value) confirmBtn.value.focus()
  } else {
    lockBodyScroll(false)
    window.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  lockBodyScroll(false)
  window.removeEventListener('keydown', onKeydown)
})

async function loadDishes() {
  try {
    // prefer server-side custom dishes when available
    try {
      const server = await $fetch('/api/dishes_custom').catch(() => null)
      const arr = Array.isArray(server) ? server : []
      const ownerKey = user.value?.id || user.value?.email || null
      dishes.value = arr.filter((d: any) => (ownerKey ? d.ownerId === ownerKey : false))
      // also merge local fallback entries not yet on server
      try {
        const raw = localStorage.getItem('resto_dishes_custom') || '[]'
        const localArr = JSON.parse(raw || '[]')
        if (Array.isArray(localArr)) {
          const missing = localArr.filter((ld: any) => !arr.find((s: any) => s.id === ld.id) && (ownerKey ? ld.ownerId === ownerKey : false))
          dishes.value = dishes.value.concat(missing)
        }
      } catch (e) {}
    } catch (e) {
      // fallback to localStorage only
      const raw = localStorage.getItem('resto_dishes_custom') || '[]'
      const arr = JSON.parse(raw || '[]')
      if (Array.isArray(arr)) {
        const ownerKey = user.value?.id || user.value?.email || null
        dishes.value = arr.filter((d: any) => {
          return ownerKey ? (d.ownerId === ownerKey) : false
        })
      } else {
        dishes.value = []
      }
    }
  } catch (e) {
    dishes.value = []
  }
}

onMounted(async () => {
  if (!isLogged.value || user.value?.role !== 'professional') {
    router.push('/auth')
    return
  }
  await loadDishes()
})

watch(user, async (u) => {
  if (!u) return
  await loadDishes()
})

function goBack() {
  router.push('/professional/dashboard')
}

function goCreate() {
  router.push('/professional/createDishes')
}

function formatPrice(p: any) {
  return typeof p === 'number' ? p.toFixed(2) + ' €' : p
}

function openConfirm(dish: Record<string, any>) {
  selectedDish.value = dish
  showConfirm.value = true
}

function cancelDelete() {
  selectedDish.value = null
  showConfirm.value = false
}

async function doDeleteConfirmed() {
  if (!selectedDish.value) return
  const id = selectedDish.value.id
  try {
    // attempt server-side delete
    try {
      await $fetch('/api/dishes', { method: 'DELETE', body: { id } })
      // remove any local copies as well
      try {
        const raw = localStorage.getItem('resto_dishes_custom') || '[]'
        const arr = JSON.parse(raw || '[]')
        const ownerKey = user.value?.id || user.value?.email || null
        const remaining = (Array.isArray(arr) ? arr : []).filter((it: any) => !(it.id === id && (ownerKey ? it.ownerId === ownerKey : false)))
        localStorage.setItem('resto_dishes_custom', JSON.stringify(remaining))
      } catch (e) {}
    } catch (err) {
      // server delete failed — fallback to local-only removal
      try {
        const raw = localStorage.getItem('resto_dishes_custom') || '[]'
        const arr = JSON.parse(raw || '[]')
        if (Array.isArray(arr)) {
          const ownerKey = user.value?.id || user.value?.email || null
          const remaining = arr.filter((it: any) => !(it.id === id && (ownerKey ? it.ownerId === ownerKey : false)))
          localStorage.setItem('resto_dishes_custom', JSON.stringify(remaining))
        }
      } catch (e) {}
    }

    // reload list from preferred source
    await loadDishes()
  } finally {
    cancelDelete()
  }
}
</script>

<style scoped>
.title { margin-bottom: 8px }
.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
  color: var(--muted);
  background: var(--card-bg);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: var(--shadow-1);
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease,
    box-shadow 0.15s ease, transform 0.05s ease;
}
.back:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.back:active {
  transform: translateY(1px);
}
.back:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.actions { margin: 12px 0 }
.dish-list { display:flex; flex-direction:column; gap:12px; margin-top:12px }
.dish-card { display:flex; gap:12px; align-items:center; background:#fff; border:1px solid #e6eef8; padding:12px; border-radius:8px }
.dish-img { width:120px; height:80px; object-fit:cover; border-radius:8px }
.dish-body { display:flex; flex-direction:column }
.dish-name { font-weight:700 }
.muted { color:var(--muted) }
.dish-actions { margin-left:auto }
.btn { padding:8px 12px; border-radius:8px; border:1px solid rgba(2,6,23,0.06); background:transparent; cursor:pointer; transition: transform .12s ease, box-shadow .12s ease, filter .12s }
.btn:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(2,6,23,0.06) }
.btn:active { transform: translateY(0) }
.btn-primary { background:var(--accent); color:#fff; border-color: rgba(var(--accent-rgb),0.16) }
.btn-primary:hover { filter:brightness(1.03) }
.btn-danger { background:#fff; border:1px solid rgba(220,38,38,0.12); color:rgb(185,28,28) }
.btn-danger:hover { background: rgba(220,38,38,0.04); border-color: rgba(220,38,38,0.22); color: rgb(185,28,28) }

/* modal (copied from admin/dashboard.vue) */
.modal-backdrop { position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; display:flex !important; align-items:center !important; justify-content:center !important; background:rgba(0,0,0,0.56) !important; z-index:2147483647 !important; pointer-events:auto !important; -webkit-font-smoothing:antialiased }
.modal { background:var(--card-bg) !important; padding:28px !important; border-radius:14px !important; width:min(620px,94%) !important; box-shadow:0 40px 80px rgba(2,6,23,0.6) !important; color:#0b1220 !important; border:1px solid rgba(2,6,23,0.08) !important; font-size:1rem !important }
.modal h3 { margin:0 0 12px 0; font-size:1.25rem; color:#071028 !important }
.modal p { margin:8px 0; color:#334155 !important }
.modal-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:18px }
.modal-body { display:flex; gap:14px; align-items:flex-start; margin-top:8px }
.modal-icon { font-size:28px; line-height:1; padding:8px; border-radius:8px; background:#fff4f2; color:#b91c1c; border:1px solid rgba(239,68,68,0.08); box-shadow:0 6px 18px rgba(239,68,68,0.04) }
.modal-text { flex:1 }
.modal-desc { margin:0 0 6px 0; font-weight:600; color:#071028 }
.btn.danger { background:#b91c1c !important; color:white !important; padding:10px 14px; border-radius:10px }
.btn.subtle { background:#f1f5f9 !important; border:1px solid rgba(2,6,23,0.06) !important; color:var(--muted) !important; padding:10px 14px; border-radius:10px }
.modal-backdrop * { box-sizing: border-box }
</style>

