export type AppPath = `/${string}`

// Astro sert le site à la racine : le chemin de la config ou des données est déjà l'URL.
export const resolveHref = (path: AppPath): AppPath => path

// Les pages pré-rendues reçoivent leur chemin avec une barre finale : on la retire (canonique, fil d'Ariane).
export const toAppPath = (pathname: string): AppPath =>
  `/${pathname.replace(/^\/+/, '').replace(/\/+$/, '')}`
