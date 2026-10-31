# boilerplate-astro

Boilerplate Astro pour les sites de contenu : le HTML est rendu sur le serveur, et la page n'envoie du JavaScript que là où l'interface en a besoin. Les composants viennent de [boilerplates-ui](https://github.com/kewinMarchand/boilerplates-ui) (couche Svelte, rendue sur le serveur). Même contenu et mêmes tests que les autres boilerplates de la famille (Next, Nuxt, SvelteKit, Symfony, HTML).

En construction, lot par lot : le squelette est en place.

## Prérequis

Docker avec Compose, `make` et git. Rien d'autre sur la machine : Node, Yarn et Chromium tournent dans le conteneur de développement.

## Démarrer

```sh
git clone https://github.com/kewinMarchand/boilerplate-astro.git
cd boilerplate-astro
make install   # image de dev et dépendances
make up        # http://localhost:4321
```

## Commandes

| Commande                              | Effet                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `make install`                        | Construit l'image de dev (Node, Chromium) et installe les dépendances dans son volume                               |
| `make up`                             | Serveur de développement sur le port 4321                                                                           |
| `make build`                          | Build de production dans `dist/`                                                                                    |
| `make qa`                             | ESLint (dont les règles d'architecture), sprite d'icônes, Prettier, `astro check`, tests unitaires                  |
| `make test-e2e`                       | Playwright, desktop et mobile, sur le build de production (port 3170)                                               |
| `make test-a11y`                      | axe-core, WCAG 2.1 AA                                                                                               |
| `make metrics`                        | Lighthouse CI (port 3270) en clair puis en sombre : échoue sous 90 en performance, sous 100 en accessibilité et SEO |
| `make icons`                          | Génère `public/icons.svg` et le type des noms depuis `icons.json`                                                   |
| `make docker-build`, `make docker-up` | Image de production, servie sur le port 3000                                                                        |

## Licence

MIT.
