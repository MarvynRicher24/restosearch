<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-accent">resto</span
          ><span class="brand-strong">search</span>
        </NuxtLink>

        <div class="header-actions">
          <NuxtLink to="/backoffice/login" class="link">Backoffice</NuxtLink>
        </div>
      </div>
    </header>

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
// plus simple, pas d'import superflu ici
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
</style>
