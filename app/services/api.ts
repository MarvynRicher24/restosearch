// app/services/api.ts
// Minimal API client utility. Keep only the low-level fetch wrapper here.
async function apiFetch<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  // prefer Nuxt's $fetch when available (declared in types/global.d.ts), fallback to global fetch
  try {
    if (typeof (globalThis as any).$fetch === 'function') {
      const result = await (globalThis as any).$fetch(path, opts)
      return result as T
    }
  } catch (e) {
    // ignore and fallback to fetch
  }
  const res = await fetch(path, opts)
  return (await res.json()) as T
}

export { apiFetch }

export default { apiFetch }
