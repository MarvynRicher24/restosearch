<template>
  <div class="container">
    <h1 class="title">Tableau de bord — Admin</h1>
    <p v-if="!user">Vérification en cours...</p>
    <div v-else class="main">
      <div class="header">
        <div>
          <p class="welcome">Bienvenue, <strong>{{ user.name }}</strong></p>
          <p class="email">{{ user.email }} — <em>{{ user.role }}</em></p>
        </div>
        <div>
          <button class="logout" @click="doLogout">Se déconnecter</button>
        </div>
      </div>

      <section class="controls">
        <p class="subtitle">Actions administratives</p>
        <div class="cards">
          <NuxtLink to="/admin/createPro" class="card card-cta">➕ Créer un restaurateur</NuxtLink>
        </div>
      </section>

      <section class="professionals">
        <h2>Professionals inscrits</h2>
        <div v-if="loading" class="muted">Chargement...</div>
        <div v-else>
          <div v-if="professionals.length === 0" class="muted">Aucun professionnel trouvé.</div>
          <ul class="pro-list">
            <li v-for="p in professionals" :key="p.email" class="pro-item">
              <div class="pro-info">
                <strong class="pro-name">{{ p.name }}</strong>
                <div class="muted pro-email">{{ p.email }}</div>
              </div>
              <div class="pro-actions">
                <button class="btn subtle" @click="goEdit(p)" style="margin-right:8px">Modifier</button>
                <button class="btn delete" @click="confirmDelete(p)">Supprimer</button>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Confirmation modal -->
      <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelDelete">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Confirmer la suppression">
          <h3>Supprimer le restaurateur</h3>
          <div class="modal-body">
                <div class="modal-icon">⚠️</div>
                <div class="modal-text">
                  <p class="modal-desc">Voulez‑vous vraiment supprimer <strong>{{ selectedPro?.name }}</strong>
                  <span class="muted">({{ selectedPro?.email }})</span> ?</p>
                  <p class="muted small">Cette action est irréversible. Les données créées localement seront supprimées.</p>
                </div>
              </div>
              <div class="modal-actions">
                <button ref="cancelBtn" class="btn subtle" @click="cancelDelete">Annuler</button>
                <button ref="confirmBtn" class="btn danger" @click="doDeleteConfirmed">Supprimer</button>
              </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'
import type { User } from '../../../types'

// Local user shape including internal _source marker used by admin UI
type LocalUser = User & { _source?: 'base' | 'custom' }

const router = useRouter()
const { user, isLogged, isAdmin, logout } = useAuth()
const professionals = ref<LocalUser[]>([])
const loading = ref(false)

// state for confirmation modal
const showConfirm = ref(false)
const selectedPro = ref<LocalUser | null>(null)

// refs to modal buttons so we can focus them
const confirmBtn = ref<HTMLButtonElement | null>(null)
const cancelBtn = ref<HTMLButtonElement | null>(null)

// prevent background scroll when modal open and handle Escape key
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
    // wait next tick then focus confirm for quick action
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

async function loadProfessionals() {
  loading.value = true
  try {
    // fetch predefined users if available
    const res = await $fetch('/data/users.json').catch(() => [])
    const base = Array.isArray(res) ? res : []
    // load any custom users created via admin form
    const customRaw = localStorage.getItem('resto_users_custom') || '[]'
    const custom = JSON.parse(customRaw || '[]')

    // load removed list to hide base users marked as removed
    const removedRaw = localStorage.getItem('resto_users_removed') || '[]'
    const removed = JSON.parse(removedRaw || '[]')

    // tag source so we can persist deletions correctly
    const baseTagged = (base as User[]).map((u) => ({ ...u, _source: 'base' } as LocalUser))
    const customTagged = (custom as User[]).map((u) => ({ ...u, _source: 'custom' } as LocalUser))

    const all = baseTagged.concat(customTagged)
    professionals.value = all
      .filter((u: LocalUser) => u.role === 'professional')
      .filter((u: LocalUser) => !(u._source === 'base' && removed.includes(u.email)))
  } catch (e) {
    professionals.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isLogged.value || !isAdmin.value) {
    router.push('/admin')
    return
  }
  loadProfessionals()
})

function doLogout() {
  logout()
  router.push('/')
}

function goEdit(p: LocalUser) {
  if (!p || !p.email) return
  router.push(`/admin/editPro/${encodeURIComponent(p.email)}`)
}

function confirmDelete(pro: LocalUser) {
  selectedPro.value = pro
  showConfirm.value = true
}

function cancelDelete() {
  selectedPro.value = null
  showConfirm.value = false
}

async function doDeleteConfirmed() {
  if (!selectedPro.value) return
  const email = selectedPro.value.email

  try {
    // Try to delete on server first
    try {
      await $fetch('/api/admin/deletePro', { method: 'DELETE', body: { email } })
      // also clean any local copies if present
      try {
        const customRaw = localStorage.getItem('resto_users_custom') || '[]'
        const custom = JSON.parse(customRaw || '[]')
        const remaining = (custom as User[]).filter((u) => u.email !== email)
        localStorage.setItem('resto_users_custom', JSON.stringify(remaining))
      } catch (e) {}
      try {
        const removedRaw = localStorage.getItem('resto_users_removed') || '[]'
        const removed = JSON.parse(removedRaw || '[]')
        const newRemoved = (Array.isArray(removed) ? removed : []).filter((e: string) => e !== email)
        localStorage.setItem('resto_users_removed', JSON.stringify(newRemoved))
      } catch (e) {}
    } catch (err) {
      // server failed — fall back to previous local-only behavior
      if (selectedPro.value._source === 'custom') {
        // remove from custom storage
        const customRaw = localStorage.getItem('resto_users_custom') || '[]'
        const custom = JSON.parse(customRaw || '[]')
        const remaining = (custom as User[]).filter((u) => u.email !== email)
        localStorage.setItem('resto_users_custom', JSON.stringify(remaining))
      } else {
        // mark as removed so base file still unchanged
        const removedRaw = localStorage.getItem('resto_users_removed') || '[]'
        const removed = JSON.parse(removedRaw || '[]')
        if (!removed.includes(email)) {
          removed.push(email)
          localStorage.setItem('resto_users_removed', JSON.stringify(removed))
        }
      }
    }

    // update in-memory list
    professionals.value = professionals.value.filter((p) => p.email !== email)
  } finally {
    cancelDelete()
  }
}
</script>

<style scoped>
.title { margin-bottom: 8px; font-size:1.6rem }
.main { margin-top: 16px }
.header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:12px; background:linear-gradient(90deg,#ffffff,#fbfdff); border-radius:10px; box-shadow:0 6px 18px rgba(37,99,235,0.04) }
.welcome { margin:0; font-size:1.15rem }
.email { margin:0; color:var(--muted) }
.subtitle { margin: 12px 0 }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap:12px }
.card { background:var(--card-bg); border:1px solid #e6eef8; padding:14px; border-radius:10px; box-shadow:0 4px 10px rgba(2,6,23,0.03); text-align:center }
.logout { padding:8px 12px; background:#ef4444; color:white; border:none; border-radius:8px; cursor:pointer }
.card-cta { display:inline-flex; align-items:center; gap:8px; justify-content:center; font-weight:600 }
.professionals { margin-top:18px }
.pro-list { list-style:none; padding:0; margin:12px 0 0; display:flex; flex-direction:column; gap:10px }
.pro-item { display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid #e6eef8; background:var(--card-bg); border-radius:10px }
.pro-info { display:flex; flex-direction:column }
.pro-name { font-size:1.02rem }
.pro-email { color:var(--muted); font-size:0.92rem }

/* buttons */
.btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.subtle { background:#f8fafc; border:1px solid rgba(2,6,23,0.06); color:var(--muted); padding:8px 12px }
.btn.delete { background:transparent; border:1px solid rgba(239,68,68,0.12); color:#ef4444; padding:8px 12px }
.btn.danger { background:#ef4444; color:white; padding:8px 12px }
.btn:hover { transform:translateY(-1px); transition:all .12s ease }

/* modal */
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
.muted { color:var(--muted) }
.small { font-size:0.85rem }
</style>
