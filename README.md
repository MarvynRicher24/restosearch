# Nuxt Minimal Starter

<!-- Replace `OWNER/REPO` with your GitHub owner and repository name to make the badges work -->

![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/OWNER/REPO/actions/workflows/deploy.yml/badge.svg)

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
```markdown
# RestoSearch

Application Nuxt 4 minimal conçue pour rechercher des restaurants et commander des plats — projet pédagogique / démonstration.

Badges CI / déploiement : remplacez `OWNER/REPO` par votre dépôt GitHub pour activer les badges.

- **CI**: `./.github/workflows/ci.yml` (tests unitaires, build et audit Lighthouse)
- **Tests E2E**: Playwright (parcours utilisateur inclus dans `tests/e2e`)

**Aperçu rapide**

- **Framework**: Nuxt 4 (Vue 3)
- **Langage**: TypeScript (mode `strict` activé)
- **I18n**: `@nuxtjs/i18n` (FR / EN)
- **PWA**: `public/manifest.json` + `public/sw.js` + `plugins/register-sw.client.ts`

**Fonctionnalités importantes**

- SSR pour pages publiques clés (`index`, `restaurant/[id]`, `dish/[id]`) avec `useAsyncData`.
- Gestion d'authentification et du panier via composables singletons : `app/composables/useAuth.ts`, `useCart.ts`, `useOrders.ts`.
- Typage centralisé : `types/index.ts`.
- Tests unitaires et E2E inclus (`tests/composables/*.spec.ts`, `tests/e2e/*`).

**Structure du projet (points saillants)**

- `app/pages/` : pages de l'application (ex. `index.vue`, `auth.vue`, `restaurant/[id].vue`, `dish/[id].vue`).
- `app/components/` : composants UI (ex. `RestaurantCard.vue`, `GlobalToast.vue`).
- `app/composables/` : stores/composables (auth, cart, orders, seo, toast).
- `app/services/api.ts` : client API centralisé.
- `server/api/` : endpoints Nitro pour données (ex. `restaurants.get.ts`).
- `public/` : assets statiques, `manifest.json`, `sw.js`, données d'exemple (`data/`).
- `tests/` : tests unitaires (Vitest) et E2E (Playwright).

**Installation & développement**

Utilisez votre gestionnaire de paquets préféré. Exemples (PowerShell) :

```powershell
# installer les dépendances
npm ci

# démarrer le serveur de développement
npm run dev

# build de production
npm run build

# preview local du build
npm run preview
```

Si vous utilisez `pnpm` ou `yarn`, adaptez les commandes (`pnpm install`, `pnpm dev`, ...).

**Scripts utiles**

- `npm run dev` : serveur dev
- `npm run build` : build production
- `npm run preview` : prévisualiser le build
- `npm run test` : tests unitaires (Vitest)
- `npm run test:e2e` : tests E2E (Playwright)
- `npm run build:analyze` : build avec analyse de bundle

**Configuration TypeScript**

- Le projet active `strict` dans `tsconfig.json`. Les types centraux sont dans `types/index.ts`.

Conseil : ajouter des interfaces pour les réponses des endpoints dans `server/api/` afin d'améliorer le typage serveur-client.

**SEO / i18n / Accessibilité**

- SEO centralisé via `app/composables/useSeo.ts` et meta dynamiques dans les pages.
- Traductions FR/EN dans `i18n/locales/fr.json` et `en.json` et configuration dans `nuxt.config.ts`.
- Bonnes pratiques d'accessibilité présentes (labels ARIA, texte alternatif, focus-visible), et la CI intègre un audit Lighthouse.

**PWA & offline**

- `public/manifest.json` fourni (nom, icons, start_url).
- `public/sw.js` simple pour pré-cache et fallback `offline.html`.
- Enregistrement du SW côté client dans `plugins/register-sw.client.ts`.

Limite connue : le service worker est basique — pour production, préférez `workbox` ou `@nuxt/pwa` pour stratégies avancées.

**Images & performance**

- Les images sont utilisées avec `loading="lazy"`. Pour de meilleures performances, envisagez `@nuxt/image` ou des balises `<picture>`/`srcset` pour WebP/AVIF et tailles responsive.
- Plugin `defineAsyncComponent` est déjà utilisé pour lazy-load de gros composants (ex. `GlobalToast`).

**Tests & CI**

- Tests unitaires : Vitest (`tests/composables/useAuth.spec.ts`, etc.).
- Tests E2E : Playwright (`tests/e2e/*`).
- Workflow CI : `./.github/workflows/ci.yml` (install, tests, build, serve et audit Lighthouse). Pour activer le badge CI dans ce README, remplacez `OWNER/REPO` par votre nom d'utilisateur et repo GitHub.

Exemples pour lancer les tests localement (PowerShell) :

```powershell
# tests unitaires
npm run test

# tests e2e (headless)
npm run test:e2e

# tests e2e (headed)
npm run test:e2e:headed
```

**Déploiement (suggestions rapides)**

- Vercel: connecter le repo -> build `npm run build` -> output `.output` (Nuxt). Automatisez via leurs intégrations.
- Netlify: configurer un build command `npm run build` et publish directory (habituellement `.output/public` ou utiliser `nuxt build && nuxt preview`).
- GitHub Pages: ajouter job de déploiement dans `.github/workflows` (ex. `peaceiris/actions-gh-pages`) et publier le contenu statique approprié.

**Checklist d'amélioration recommandée**

- Typage serveur: éviter `any` dans `server/api/*` et déclarer interfaces.
- Images: ajouter `srcset` / `<picture>` et envisager génération WebP/AVIF.
- CI/CD: ajouter un job `deploy` et remplacer les badges README.
- Accessibilité: exécuter Lighthouse et corriger les recommandations pour viser ≥90.

**Contribuer**

1. Forkez le projet
2. Créez une branche `feat/description-courte`
3. Ouvrez une PR avec description et tests le cas échéant

**Licence**

Ce dépôt est livré sans licence explicite. Ajoutez un fichier `LICENSE` si vous souhaitez rendre ce projet réutilisable.

---

Pour toute question ou si vous voulez que j'applique automatiquement certaines améliorations (typage server, badge CI, workflow déploiement ou conversion d'images), dites quelle tâche prioritaire vous souhaitez et je m'en occupe.
```
