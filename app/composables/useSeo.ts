import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#app'

type SeoOptions = {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  noindex?: boolean
  jsonld?: Record<string, any> | null
}

export function useSeo(opts: SeoOptions) {
  const route = useRoute()
  const config = useRuntimeConfig()

  const siteName = 'RestoSearch'

  const canonical = computed(() => {
    if (opts.url) return opts.url
    if (process.client && typeof window !== 'undefined') return window.location.href
    // fallback to route path when server-side without origin
    const base = (config.public && (config.public.siteUrl as string)) || ''
    return base ? `${base}${route.fullPath}` : route.fullPath
  })

  const title = opts.title ? opts.title : siteName
  const description = opts.description ?? ''
  const image = opts.image ?? ''
  const type = opts.type ?? (opts.jsonld ? 'article' : 'website')

  const meta: Array<Record<string, string>> = []
  if (description) meta.push({ name: 'description', content: description })
  if (opts.noindex) meta.push({ name: 'robots', content: 'noindex, nofollow' })

  // Open Graph
  meta.push({ property: 'og:title', content: title })
  if (description) meta.push({ property: 'og:description', content: description })
  meta.push({ property: 'og:type', content: type })
  if (image) meta.push({ property: 'og:image', content: image })
  if (canonical.value) meta.push({ property: 'og:url', content: canonical.value })

  // Twitter
  meta.push({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' })
  meta.push({ name: 'twitter:title', content: title })
  if (description) meta.push({ name: 'twitter:description', content: description })
  if (image) meta.push({ name: 'twitter:image', content: image })

  const link: Array<Record<string, string>> = []
  if (canonical.value) link.push({ rel: 'canonical', href: canonical.value })

  const script = opts.jsonld
    ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(opts.jsonld),
        },
      ]
    : []

  return {
    title,
    meta,
    link,
    script,
  }
}

export default useSeo
