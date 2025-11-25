export default defineNuxtConfig({
  compatibilityDate: "2024-10-10",

  runtimeConfig: {
    // Variables côté serveur uniquement
    NITRO_SECRET: process.env.NITRO_SECRET || "dev-secret-change-in-production",
    // Variables publiques (côté client/serveur)
    public: {
      apiBase: "/api",
    },
  },

  css: ["~/assets/css/site.css"],

  app: {
    head: {
      title: "RestoSearch - Trouvez votre restaurant idéal",
      htmlAttrs: {
        lang: 'fr'
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Recherchez et découvrez les meilleurs restaurants près de chez vous",
        },
        { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', href: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' }
      ]
    },
  },

  nitro: {
    experimental: {
      wasm: true,
    },
  },

  modules: ["@nuxtjs/i18n"],
  i18n: {
    locales: [
      { code: 'fr', iso: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected'
    },
    // For advanced vue-i18n options use an `i18n.config` file or the module's recommended config patterns.
    // Keep default `vueI18n` value (module will resolve i18n config file if provided).
  }
});