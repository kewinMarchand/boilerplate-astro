export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme'
export const COLOR_SCHEMES = ['auto', 'light', 'dark'] as const

export type ColorScheme = (typeof COLOR_SCHEMES)[number]

/** Script d'amorçage (avec celui du mode renforcé) : `app.html` sert « auto », le choix mémorisé le remplace sans flash. */
export const COLOR_SCHEME_SCRIPT = `try{var c=localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}');if(c==='light'||c==='dark')document.documentElement.dataset.colorScheme=c}catch(e){}`

const isColorScheme = (value: string | null | undefined): value is ColorScheme =>
  COLOR_SCHEMES.some((scheme) => scheme === value)

export const currentColorScheme = (): ColorScheme => {
  const value = document.documentElement.dataset.colorScheme
  return isColorScheme(value) ? value : 'auto'
}

export const applyColorScheme = (scheme: ColorScheme) => {
  document.documentElement.dataset.colorScheme = scheme
  try {
    if (scheme === 'auto') localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY)
    else localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme)
  } catch {
    console.warn('Thème : préférence non enregistrée.')
  }
}
