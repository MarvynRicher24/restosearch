# Architecture du projet

Résumé synthétique de l'organisation pour respecter les bonnes pratiques "structuré et modulaire".

- **Pages**: `app/pages` — vues et routes Nuxt.
- **Composants**: `app/components` — composants réutilisables UI.
- **Stores / State**: `app/stores` — barrel qui expose les hooks/états (wrap des `composables`).
- **Composables**: `app/composables` — logique réutilisable (auth, panier, commandes, toast).
- **Services**: `app/services` — wrappers API (barrel présent `app/services/index.ts` qui ré-exporte `api.ts`).
 - **Services**: `app/services` — wrappers API par domaine (ex: `restaurants.ts`, `dishes.ts`, `users.ts`, `professional.ts`) et un client bas-niveau `api.ts`.
- **Types**: `types` — interfaces et utilitaires partagés (`types/index.ts` exporte les types et helpers runtime).

Bonnes pratiques appliquées:
- Barrels (`index.ts`) pour `types`, `app/services` et `app/stores` afin de simplifier les imports.
 - Barrels (`index.ts`) pour `types`, `app/services` et `app/stores` afin de simplifier les imports. Le barrel de `app/services` expose des exports nommés par domaine et un export par défaut agrégé pour compatibilité.
- Séparation claire entre UI (`components`), pages, logique réutilisable (`composables`) et services.

Suggestions (optionnelles):
- Ajouter des `index.ts` (barrels) pour `app/components` si vous voulez importer un lot de composants.
- Ajouter `ESLint`/`Prettier` et un `npm run build` CI pour capturer les erreurs d'exports.

Conventions et recommandations (appliquées dans cette version):

- **Séparation des services**: Les fonctions d'appel réseau sont organisées par domaine (`restaurants`, `dishes`, `users`, `professional`) et importent un `apiFetch` central dans `api.ts`. Cela facilite les tests et l'évolution.
- **Types partagés**: Toutes les interfaces sont dans `types/index.ts` et doivent être utilisées par les services et composants pour éviter `any`.
- **Barrel et compatibilité**: Le barrel `app/services/index.ts` exporte tout par domaine et fournit un `default` agrégé pour conserver la compatibilité avec les imports existants.
- **Tests**: Ajouter des tests unitaires pour les `composables` et les services (Vitest/Jest) est recommandé pour valider la logique sans lancer le serveur.
- **Naming**: Préfixer les services par domaine et garder des fonctions nommées (`getDishes`, `postDish`) améliore la lisibilité.

Si vous voulez, je peux:
- scinder d'autres fichiers (ex: composants volumineux) ;
- ajouter un exemple de test pour un `composable` ;
- ajouter une configuration minimale `Vitest` + script `npm run test`.

Ce fichier est informatif et n'affecte pas le comportement de l'application.
