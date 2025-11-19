// app/services/api.ts
// Minimal API client utility. Keep only the low-level fetch wrapper here.
/**
 * Wrapper autour de $fetch / fetch pour centraliser les appels API.
 * - Utilise Nuxt `$fetch` si disponible, sinon `fetch` global.
 * - Retourne le body typé en `T`.
 */
async function apiFetch<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  // prefer Nuxt's $fetch when available (declared in types/global.d.ts), fallback to global fetch
  try {
    if (typeof (globalThis as any).$fetch === 'function') {
      // Nuxt $fetch throws for non-2xx responses, keep that behaviour
      const result = await (globalThis as any).$fetch(path, opts)
      return result as T
    }
  } catch (e) {
    // if $fetch failed, fallthrough to native fetch to capture response body when possible
  }

  const res = await fetch(path, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err: any = new Error(`Request failed ${res.status} ${res.statusText}`)
    err.status = res.status
    err.body = text
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }
  // fallback: return raw text if not JSON
  return (await res.text()) as unknown as T
}

export { apiFetch }

export default { apiFetch }
