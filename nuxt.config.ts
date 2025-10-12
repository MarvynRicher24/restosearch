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
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Recherchez et découvrez les meilleurs restaurants près de chez vous",
        },
      ],
    },
  },
  nitro: {
    experimental: {
      wasm: true,
    },
  },
});
