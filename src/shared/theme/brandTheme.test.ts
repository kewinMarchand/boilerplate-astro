import { BRAND_TOKEN_KEYS } from '@/shared/config'

import { brandThemeCss } from './brandTheme'

import type { BrandTokens } from '@/shared/config'

const tokens = (prefix: string) =>
  Object.fromEntries(
    BRAND_TOKEN_KEYS.map((key, index) => [key, `${prefix}${String(index).padStart(2, '0')}`]),
  ) as BrandTokens

describe('brandThemeCss', () => {
  const css = brandThemeCss({ light: tokens('#aaaa'), dark: tokens('#bbbb') })

  it('redéfinit les douze jetons en clair, hors mode renforcé', () => {
    expect(css).toContain(
      'html:not([data-a11y-mode="enhanced"]){--bui-color-primary:#aaaa00;--bui-color-primary-dark:#aaaa01;',
    )
    expect(css.match(/--bui-color-/g)).toHaveLength(36)
  })

  it('pose le sombre sous les sélecteurs de la bibliothèque, jamais en mode renforcé', () => {
    expect(css).toContain(
      'html[data-color-scheme="dark"]:not([data-a11y-mode="enhanced"]){--bui-color-primary:#bbbb00;',
    )
    expect(css).toContain(
      '@media (prefers-color-scheme:dark){html[data-color-scheme="auto"]:not([data-a11y-mode="enhanced"]){--bui-color-primary:#bbbb00;',
    )
  })
})
