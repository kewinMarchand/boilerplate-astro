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
| `MAINTENANCE`                                          | `1` : toutes les pages répondent 503 avec la page de maintenance, dans la langue de l'adresse                                                                                   |
| `DEV_ROUTES`                                           | `1` : expose `/charte-graphique` et `/erreur-test` hors du serveur de développement                                                                                             |
| `PUBLIC_GLITCHTIP_DSN`, `PUBLIC_GLITCHTIP_ENVIRONMENT` | Suivi des erreurs GlitchTip, serveur et navigateur. Vide : aucun SDK chargé, aucune requête                                                                                     |
| `PUBLIC_MATOMO_URL`, `PUBLIC_MATOMO_SITE_ID`           | Mesure d'audience Matomo sans cookie. Vides : aucun script, aucune requête, pas de paragraphe sur la page Données personnelles                                                  |
| `API_SCENARIO`                                         | Scénario de l'API (`X-Scenario`) pour tous les appels, serveur et navigateur : `bilingual` sert le site bilingue de test. Vide en production                                    |
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

À personnaliser : `src/shared/config/` (nom, description, éditeur pour le SEO, navigation, audit d'accessibilité), `src/shared/i18n/dictionaries/` (libellés de l'interface, `fr.ts` et `en.ts`), `public/` (logo, favicons, manifeste, image de partage), `src/views/home/` (hero), puis les modules. Le carrousel de l'accueil et le texte des pages légales se modifient dans l'admin de l'API Platform (`/admin`).

## Commandes

| Commande                              | Effet                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `make install`                        | Construit l'image de dev (Node, Chromium) et installe les dépendances dans son volume                                    |
| `make up`                             | Serveur de développement sur le port 4321                                                                                |
| `make build`                          | Build de production dans `dist/`, fichiers statiques précompressés (brotli, gzip)                                        |
| `make start`                          | Sert le build par `server.mjs`                                                                                           |
| `make qa`                             | ESLint (dont les règles d'architecture), auto-test des règles, sprite d'icônes, Prettier, `astro check`, tests unitaires |
| `make test-unit`                      | Vitest ; `VITEST_CHANGED=1` : seulement les tests touchés par les modifications non commitées (`--changed`)              |
| `make e2e-vite`                       | Playwright desktop sur les e2e modifiés depuis `origin/main`, `FICHIERS="…"` ou `GREP="…"` ; build réutilisé             |
| `make test-e2e`                       | Playwright, desktop et mobile, sur le build de production (port 3170)                                                    |
| `make test-a11y`                      | axe-core, WCAG 2.1 AA, chaque page en standard, sombre et renforcé                                                       |
| `make metrics`                        | Lighthouse CI (port 3270) en clair puis en sombre : échoue sous 90 en performance, sous 100 en accessibilité et SEO      |
| `make icons`                          | Génère `public/icons.svg` et le type des noms depuis `icons.json`                                                        |
| `make api-types`                      | Génère les types de l'API depuis son schéma OpenAPI                                                                      |
| `make docker-build`, `make docker-up` | Image de production, servie sur le port 3000                                                                             |

## Langues du site

Un site n'a qu'une langue, le français, tant que l'identité du site (`GET /api/site-identity`, administrée dans l'API) n'en active pas d'autre : routes, HTML et appels à l'API restent alors ceux d'un site monolingue. À plus d'une langue (la première est la langue par défaut) :

- la langue par défaut n'a pas de préfixe, les autres en ont un (`/en/produit/swiss-cheese-plant`) ; un préfixe qui n'est pas une langue activée répond 404, sans redirection selon le navigateur ;
- l'en-tête montre un sélecteur de langue, qui mène à la même page dans l'autre langue, ou à son accueil si la page n'y existe pas ;
- chaque lecture de l'API passe `locale=<langue de la page>`, le contact envoie sa langue en `Accept-Language` ;
- `<html lang>`, canonique, `og:locale`, `hreflang` (et `x-default`), `inLanguage` et sitemap suivent la langue de la page.

Libellés : une clé par texte dans `src/shared/i18n/dictionaries/fr.ts` et `en.ts` (mêmes clés, vérifiées par le type et un test ; `{nom}` remplacé par `format`, pluriels par `plural`), lus sur le serveur dans `Astro.locals.dictionary` ; un îlot reçoit en propriété les seuls libellés qu'il affiche, jamais un texte que seul le serveur lit. Un lien interne passe par `resolveHref`, qui ajoute le préfixe de la page. Une langue activée sans dictionnaire prend les libellés de la langue par défaut. Pour voir le site bilingue des fixtures : `API_SCENARIO=bilingual` dans `.env`, puis `make build start`.

## Architecture

Découpage commun aux boilerplates (`boilerplates-commun/ARCHITECTURE-DDD.md`), vérifié par ESLint :

```
src/
  pages/        couche de routage : un fichier par route, qui délègue
  views/        pages qui composent des modules ou sans métier (accueil, légal, erreurs, charte)
  modules/      un dossier par sous-domaine : catalog, blog, task, contact, content
    <module>/domain, application, infrastructure, ui, index.ts (seul export public)
  shared/       socle sans métier : config, langues, SEO, API, observabilité, sécurité, thème, kit d'interface
  actions/      actions serveur Astro (formulaire de contact)
  middleware.ts maintenance, langue de la page, menu des catégories, CSP, compression, erreurs
server.mjs      serveur de production : statiques précompressés, puis Astro
```

## Production

`make docker-build` construit l'image (Node 26 Alpine, dépendances d'exécution seulement). `server.mjs` sert `dist/client` dans la variante précompressée que le navigateur accepte, avec un cache d'un an sur les fichiers versionnés de `/_astro/`, puis confie le reste à Astro, dont les pages sont compressées à la volée. Au démarrage, `[boilerplate-astro] serveur démarré (production)` permet de retrouver le bon fichier de log. La CSP est en mode Report-Only : chaque écart est signalé à `POST /api/csp-report` et écrit sur la sortie standard.

## Tests

En développement, on ne lance que ce que le changement touche : `make qa` (porte de chaque commit), puis `make e2e-vite`. La suite complète (e2e desktop et mobile, accessibilité, Lighthouse) tourne en CI à chaque push ; `make test-e2e`, `make test-a11y`, `make metrics` et `make qa-full` restent disponibles à la main.

`make e2e-vite` (`tools/e2e-vite.sh`) lance Playwright sur le seul projet desktop : par défaut les fichiers e2e modifiés par rapport à `origin/main` (`--only-changed`, qui suit aussi les fichiers importés par les tests), sinon `FICHIERS="tests/e2e/panier.e2e.ts …"` ou `GREP="motif"` (titre des tests, sur toute la suite e2e) ; une sélection vide réussit (`--pass-with-no-tests`). Il ne reconstruit `dist/` que si les sources ont changé depuis son dernier build : empreinte SHA-256 des fichiers suivis ou non ignorés par git (hors `tests/`, `*.md`, `*.test.ts`, configurations Playwright et `.github/`), des fichiers `.env*` et des variables `PUBLIC_*`, écrite dans `dist/empreinte-e2e` après le build (`PUBLIC_SITE_URL` de la suite) ; Astro vidant `dist/` à chaque build, un `make build` lancé entre-temps force la reconstruction. Playwright sert ensuite `dist/` sans le reconstruire (`E2E_SANS_BUILD=1`). Temps mesurés (panier, 9 tests) : 6,4 s avec reconstruction, 2,9 s build réutilisé.

- **Unitaires** : `src/**/*.test.ts` (domaine du catalogue, URL, prix, conformité, chargement du carrousel et des pages légales, SEO, Matomo, CSP, composants des bascules).
- **End-to-end** : `tests/e2e/`, un fichier par page ou par brique (le site bilingue, `bilingue.e2e.ts`, est le build de la suite servi avec `API_SCENARIO=bilingual` sur les ports 4102 et 4103), ciblage par `data-testid`, rendus conditionnels testés présents et absents, scénarios sans JavaScript (carrousel, catalogue, contact, thème), états d'erreur et de liste vide par l'en-tête `X-Scenario`, envois vers un GlitchTip et un Matomo factices.
- **Accessibilité** : `tests/a11y/`, axe-core sur chaque route, en standard, sombre et renforcé, desktop et mobile, menus ouverts compris. Axe ne couvre qu'une partie du RGAA : la déclaration reste « non conforme » sans audit.

## Intégration continue

`.github/workflows/ci.yml` appelle les mêmes cibles `make` que le poste de dev : `make qa`, puis, avec l'API Hono démarrée, `make test-e2e test-a11y` et `make metrics`.

## Licence

MIT.
