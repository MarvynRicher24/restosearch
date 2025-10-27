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
                <div class="muted small pro-restaurant">{{ p.restaurant || '' }}</div>
              </div>
              <div class="pro-actions">
                <button class="btn delete" @click="confirmDelete(p)">Supprimer</button>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
    <!-- Confirmation modal -->
    <div v-if="showConfirm" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal">
        <h3>Supprimer le restaurateur</h3>
        <p>Voulez‑vous vraiment supprimer <strong>{{ selectedPro?.name }}</strong>
          <span class="muted">({{ selectedPro?.email }})</span> ?</p>
        <p class="muted small">Cette action est irréversible. Les données créées localement seront supprimées.</p>
        <div class="modal-actions">
          <button class="btn subtle" @click="cancelDelete">Annuler</button>
          <button class="btn danger" @click="doDeleteConfirmed">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { user, isLogged, isAdmin, logout } = useAuth()
const professionals = ref<any[]>([])
const loading = ref(false)

// state for confirmation modal
const showConfirm = ref(false)
const selectedPro = ref<any>(null)

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
    const baseTagged = base.map((u: any) => ({ ...u, _source: 'base' }))
    const customTagged = custom.map((u: any) => ({ ...u, _source: 'custom' }))

    const all = baseTagged.concat(customTagged)
    professionals.value = all
      .filter((u: any) => u.role === 'professional')
      .filter((u: any) => !(u._source === 'base' && removed.includes(u.email)))
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

function confirmDelete(pro: any) {
  selectedPro.value = pro
  showConfirm.value = true
}

function cancelDelete() {
  selectedPro.value = null
  showConfirm.value = false
}

function doDeleteConfirmed() {
  if (!selectedPro.value) return
  const email = selectedPro.value.email

  try {
    if (selectedPro.value._source === 'custom') {
      // remove from custom storage
      const customRaw = localStorage.getItem('resto_users_custom') || '[]'
      const custom = JSON.parse(customRaw || '[]')
      const remaining = custom.filter((u: any) => u.email !== email)
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

    // update in-memory list
    professionals.value = professionals.value.filter((p: any) => p.email !== email)
  } finally {
    cancelDelete()
  }
}
</script>

<style scoped>
:root{ --bg:#f7fafc; --card:#ffffff; --muted:#6b7280; --accent:#2563eb; --danger:#ef4444 }
.title { margin-bottom: 8px; font-size:1.6rem }
.main { margin-top: 16px }
.header { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:12px; background:linear-gradient(90deg,#ffffff,#fbfdff); border-radius:10px; box-shadow:0 6px 18px rgba(37,99,235,0.04) }
.welcome { margin:0; font-size:1.15rem }
.email { margin:0; color:var(--muted) }
.subtitle { margin: 12px 0 }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap:12px }
.card { background:var(--card); border:1px solid #e6eef8; padding:14px; border-radius:10px; box-shadow:0 4px 10px rgba(2,6,23,0.03); text-align:center }
.logout { padding:8px 12px; background:var(--danger); color:white; border:none; border-radius:8px; cursor:pointer }
.card-cta { display:inline-flex; align-items:center; gap:8px; justify-content:center; font-weight:600 }
.professionals { margin-top:18px }
.pro-list { list-style:none; padding:0; margin:12px 0 0; display:flex; flex-direction:column; gap:10px }
.pro-item { display:flex; justify-content:space-between; align-items:center; padding:14px; border:1px solid #e6eef8; background:var(--card); border-radius:10px }
.pro-info { display:flex; flex-direction:column }
.pro-name { font-size:1.02rem }
.pro-email { color:var(--muted); font-size:0.92rem }
.pro-restaurant { color:var(--muted); font-size:0.85rem }

/* buttons */
.btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600 }
.btn.subtle { background:transparent; border:1px solid rgba(2,6,23,0.06); color:var(--muted) }
.btn.delete { background:transparent; border:1px solid rgba(239,68,68,0.12); color:var(--danger) }
.btn.danger { background:var(--danger); color:white }
.btn:hover { transform:translateY(-1px); transition:all .12s ease }

/* modal */
.modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.45); z-index:60 }
.modal { background:var(--card); padding:20px; border-radius:12px; width:min(540px,94%); box-shadow:0 20px 40px rgba(2,6,23,0.3) }
.modal h3 { margin:0 0 8px 0 }
.modal p { margin:6px 0 }
.modal-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:12px }
.muted { color:var(--muted) }
.small { font-size:0.85rem }
</style>
