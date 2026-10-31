export class CatalogLoadError extends Error {
  constructor() {
    super('Impossible de charger le catalogue pour le moment.')
    this.name = 'CatalogLoadError'
  }
}
