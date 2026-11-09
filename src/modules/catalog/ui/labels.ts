import type { Dictionary } from '@/shared/i18n'

/** Libellés de l'îlot du catalogue, dans la langue de la page : sa partie du dictionnaire, pas davantage. */
export type CatalogLabels = Pick<Dictionary, 'catalog' | 'language'> & {
  close: string
  ui: Pick<Dictionary['ui'], 'removeFilter'> & {
    alert: Pick<Dictionary['ui']['alert'], 'info' | 'error'>
  }
}
