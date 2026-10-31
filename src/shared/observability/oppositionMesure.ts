/**
 * Opposition à la mesure d'audience (recommandation de la fiche CNIL n° 17 sur les traceurs
 * exemptés de consentement). Le refus de Matomo passe par un cookie, impossible avec
 * `disableCookies` : il est donc gardé dans le stockage local, et lu avant chaque page vue et
 * chaque événement. Un stockage indisponible (navigation privée stricte) vaut absence de refus.
 */
const CLE = 'mesure-audience-refusee'
const EVENEMENT = 'mesure-audience-changee'

export const mesureRefusee = (): boolean => {
  try {
    return window.localStorage.getItem(CLE) === '1'
  } catch {
    return false
  }
}

export const changerOppositionMesure = (refusee: boolean) => {
  try {
    if (refusee) window.localStorage.setItem(CLE, '1')
    else window.localStorage.removeItem(CLE)
  } catch {
    return
  }
  window.dispatchEvent(new Event(EVENEMENT))
}

/** Abonnement pour `useSyncExternalStore` : ce même onglet, et les autres onglets du site. */
export const abonnerOppositionMesure = (rappel: () => void) => {
  window.addEventListener(EVENEMENT, rappel)
  window.addEventListener('storage', rappel)
  return () => {
    window.removeEventListener(EVENEMENT, rappel)
    window.removeEventListener('storage', rappel)
  }
}
