import { BRAND_TOKEN_KEYS } from '@/shared/config'

import type { BrandTokens, SiteIdentity } from '@/shared/config'

const declarations = (tokens: BrandTokens) =>
  BRAND_TOKEN_KEYS.map((key) => `--bui-color-${key}:${tokens[key]}`).join(';')

// Sélecteurs de boilerplates-ui préfixés par `html` : ils l'emportent sur ceux de la bibliothèque quel que
// soit l'ordre des feuilles, et le mode renforcé garde ses couleurs.
const LIGHT = 'html:not([data-a11y-mode="enhanced"])'
const DARK = 'html[data-color-scheme="dark"]:not([data-a11y-mode="enhanced"])'
const AUTO = 'html[data-color-scheme="auto"]:not([data-a11y-mode="enhanced"])'

/** Contenu du bloc `<style>` des couleurs de marque, rendu sur le serveur dans le `<head>`. */
export const brandThemeCss = ({ light, dark }: NonNullable<SiteIdentity['theme']>) =>
  `${LIGHT}{${declarations(light)}}${DARK}{${declarations(dark)}}@media (prefers-color-scheme:dark){${AUTO}{${declarations(dark)}}}`
