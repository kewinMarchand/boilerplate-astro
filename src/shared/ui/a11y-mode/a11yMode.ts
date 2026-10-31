export const A11Y_MODE_STORAGE_KEY = 'a11y-mode'
export const A11Y_MODE_ENHANCED = 'enhanced'

/** Script d'amorçage, servi dans la même balise que celui du thème (hooks.server.ts). */
export const A11Y_MODE_SCRIPT = `try{if(localStorage.getItem('${A11Y_MODE_STORAGE_KEY}')==='${A11Y_MODE_ENHANCED}')document.documentElement.dataset.a11yMode='${A11Y_MODE_ENHANCED}'}catch(e){}`

export const isEnhancedModeActive = () =>
  document.documentElement.dataset.a11yMode === A11Y_MODE_ENHANCED

export const applyA11yMode = (enhanced: boolean) => {
  const root = document.documentElement
  if (enhanced) {
    root.dataset.a11yMode = A11Y_MODE_ENHANCED
  } else {
    delete root.dataset.a11yMode
  }

  try {
    if (enhanced) {
      localStorage.setItem(A11Y_MODE_STORAGE_KEY, A11Y_MODE_ENHANCED)
    } else {
      localStorage.removeItem(A11Y_MODE_STORAGE_KEY)
    }
  } catch {
    console.warn('Mode accessibilité renforcée : préférence non enregistrée.')
  }
}
