# boilerplate-astro

Boilerplate Astro pour les sites de contenu : le HTML est rendu sur le serveur, et la page n'envoie du JavaScript que là où l'interface en a besoin. Les composants viennent de [boilerplates-ui](https://github.com/kewinMarchand/boilerplates-ui) (couche Svelte, rendue sur le serveur). Même contenu et mêmes tests que les autres boilerplates de la famille (Next, Nuxt, SvelteKit, Symfony, HTML) : une jardinerie tropicale fictive avec accueil, catalogue à facettes, tâches, contact, pages légales et charte graphique.

Le site suit le thème clair ou sombre du système, que le bouton « Thème » de l'en-tête permet de forcer. Le bouton « Accessibilité renforcée » agrandit le texte, espace le contenu (WCAG 1.4.12), renforce les contrastes et coupe les animations ; il garde toujours la page en clair. Les deux choix sont mémorisés dans le navigateur et appliqués avant le premier affichage.

## Stack

| Brique                                      | Rôle                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Astro 7, `@astrojs/node`                    | Rendu serveur à la demande, serveur Node (`server.mjs`)                          |
| boilerplates-ui (Svelte), `@astrojs/svelte` | Composants rendus sur le serveur ; îlots hydratés pour l'interactif seulement    |
| Tailwind 4                                  | Style, sur le préréglage des jetons de boilerplates-ui                           |
| `openapi-fetch`, `openapi-typescript`, zod  | Client typé de l'API commune, validation de l'URL du catalogue et du formulaire  |
| Astro Actions                               | Formulaire de contact, avec ou sans JavaScript                                   |
| Embla Carousel                              | Carrousel de l'accueil                                                           |
| Vitest, Playwright, axe-core, Lighthouse CI | Tests unitaires, e2e, accessibilité (3 modes), performance en clair et en sombre |

## Ce qui envoie du JavaScript

Un composant Svelte sans directive `client:*` est rendu sur le serveur en HTML, sans script. Seuls ces îlots sont hydratés :

| Îlot                                                                                         | Chargement                                                                  |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Bascules du thème et du mode renforcé                                                        | `client:load`                                                               |
| Menu de catégories (desktop)                                                                 | `client:media="(min-width: 1024px)"`                                        |
| Menu mobile                                                                                  | `client:media="(max-width: 1023.98px)"`                                     |
| Carrousel de l'accueil                                                                       | `client:visible`                                                            |
| Vue du catalogue (filtres, tri, pagination)                                                  | `client:load`, conservée d'une page à l'autre par le routeur client d'Astro |
| Liste des tâches, formulaire de contact, opposition à la mesure d'audience, charte graphique | `client:load`                                                               |

## Prérequis

Docker avec Compose, `make` et git. Rien d'autre sur la machine : Node, Yarn et Chromium tournent dans le conteneur de développement. Les données viennent d'une des deux API de test, [boilerplate-api-platform](https://github.com/kewinMarchand/boilerplate-api-platform) (port 8090) ou [boilerplate-hono](https://github.com/kewinMarchand/boilerplate-hono) (port 8091), lancée à côté.

## Démarrage

```sh
git clone https://github.com/kewinMarchand/boilerplate-astro.git
cd boilerplate-astro
cp .env.example .env   # puis choisir l'API : API_URL=http://localhost:8091 pour Hono
make install           # image de dev et dépendances
make up                # http://localhost:4321
```

| Variable                                               | Rôle                                                                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL`                                      | URL publique (canonique, Open Graph, JSON-LD, sitemap), lue à l'exécution                                                                                                       |
| `API_URL`                                              | Origine de l'API : `http://localhost:8090` (API Platform, défaut) ou `http://localhost:8091` (Hono), même contrat. L'API doit autoriser l'origine du site en CORS (page Tâches) |
| `MAINTENANCE`                                          | `1` : toutes les pages répondent 503 avec la page de maintenance                                                                                                                |
| `DEV_ROUTES`                                           | `1` : expose `/charte-graphique` et `/erreur-test` hors du serveur de développement                                                                                             |
| `PUBLIC_GLITCHTIP_DSN`, `PUBLIC_GLITCHTIP_ENVIRONMENT` | Suivi des erreurs GlitchTip, serveur et navigateur. Vide : aucun SDK chargé, aucune requête                                                                                     |
| `PUBLIC_MATOMO_URL`, `PUBLIC_MATOMO_SITE_ID`           | Mesure d'audience Matomo sans cookie. Vides : aucun script, aucune requête, pas de paragraphe sur la page Données personnelles                                                  |
| `API_SCHEMA_URL`                                       | Schéma OpenAPI lu par `make api-types`                                                                                                                                          |

Toutes sont lues à l'exécution : les changer ne demande pas de reconstruire le site.

## Démarrer un projet à partir de ce dépôt

Le dépôt est un modèle GitHub (« Use this template ») :

```sh
gh repo create mon-projet --template kewinMarchand/boilerplate-astro --private --clone
```

Pour reprendre ensuite une évolution du boilerplate, l'historique n'étant pas commun, on prend les commits utiles un par un :

```sh
git remote add boilerplate https://github.com/kewinMarchand/boilerplate-astro.git
git fetch boilerplate
git cherry-pick <sha>
```

À personnaliser : `src/shared/config/` (nom, description, éditeur, hébergeur, navigation, audit d'accessibilité), `public/` (logo, favicons, manifeste, image de partage), `src/views/home/` (hero), puis les modules. Le carrousel de l'accueil et le texte des pages légales se modifient dans l'admin de l'API Platform (`/admin`).

## Commandes

| Commande                              | Effet                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `make install`                        | Construit l'image de dev (Node, Chromium) et installe les dépendances dans son volume                                    |
| `make up`                             | Serveur de développement sur le port 4321                                                                                |
| `make build`                          | Build de production dans `dist/`, fichiers statiques précompressés (brotli, gzip)                                        |
| `make start`                          | Sert le build par `server.mjs`                                                                                           |
| `make qa`                             | ESLint (dont les règles d'architecture), auto-test des règles, sprite d'icônes, Prettier, `astro check`, tests unitaires |
| `make test-e2e`                       | Playwright, desktop et mobile, sur le build de production (port 3170)                                                    |
| `make test-a11y`                      | axe-core, WCAG 2.1 AA, chaque page en standard, sombre et renforcé                                                       |
| `make metrics`                        | Lighthouse CI (port 3270) en clair puis en sombre : échoue sous 90 en performance, sous 100 en accessibilité et SEO      |
| `make icons`                          | Génère `public/icons.svg` et le type des noms depuis `icons.json`                                                        |
| `make api-types`                      | Génère les types de l'API depuis son schéma OpenAPI                                                                      |
| `make docker-build`, `make docker-up` | Image de production, servie sur le port 3000                                                                             |

## Architecture

Découpage commun aux boilerplates (`boilerplates-commun/ARCHITECTURE-DDD.md`), vérifié par ESLint :

```
src/
  pages/        couche de routage : un fichier par route, qui délègue
  views/        pages qui composent des modules ou sans métier (accueil, légal, erreurs, charte)
  modules/      un dossier par sous-domaine : catalog, blog, task, contact, content
    <module>/domain, application, infrastructure, ui, index.ts (seul export public)
  shared/       socle sans métier : config, SEO, API, observabilité, sécurité, thème, kit d'interface
  actions/      actions serveur Astro (formulaire de contact)
  middleware.ts maintenance, menu des catégories, CSP, compression, erreurs
server.mjs      serveur de production : statiques précompressés, puis Astro
```

## Production

`make docker-build` construit l'image (Node 24 Alpine, dépendances d'exécution seulement). `server.mjs` sert `dist/client` dans la variante précompressée que le navigateur accepte, avec un cache d'un an sur les fichiers versionnés de `/_astro/`, puis confie le reste à Astro, dont les pages sont compressées à la volée. Au démarrage, `[boilerplate-astro] serveur démarré (production)` permet de retrouver le bon fichier de log. La CSP est en mode Report-Only : chaque écart est signalé à `POST /api/csp-report` et écrit sur la sortie standard.

## Tests

- **Unitaires** : `src/**/*.test.ts` (domaine du catalogue, URL, prix, conformité, chargement du carrousel et des pages légales, SEO, Matomo, CSP, composants des bascules).
- **End-to-end** : `tests/e2e/`, un fichier par page ou par brique, ciblage par `data-testid`, rendus conditionnels testés présents et absents, scénarios sans JavaScript (carrousel, catalogue, contact, thème), états d'erreur et de liste vide par l'en-tête `X-Scenario`, envois vers un GlitchTip et un Matomo factices.
- **Accessibilité** : `tests/a11y/`, axe-core sur chaque route, en standard, sombre et renforcé, desktop et mobile, menus ouverts compris. Axe ne couvre qu'une partie du RGAA : la déclaration reste « non conforme » sans audit.

## Intégration continue

`.github/workflows/ci.yml` appelle les mêmes cibles `make` que le poste de dev : `make qa`, puis, avec l'API Hono démarrée, `make test-e2e test-a11y` et `make metrics`.

## Licence

MIT.
