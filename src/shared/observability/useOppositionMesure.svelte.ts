import { onMount } from 'svelte'

import { abonnerOppositionMesure, changerOppositionMesure, mesureRefusee } from './oppositionMesure'

/** Refus de la mesure d'audience par le visiteur, et le moyen de le changer. Faux au rendu serveur. */
export const useOppositionMesure = () => {
  let refusee = $state(false)

  onMount(() => {
    const lire = () => {
      refusee = mesureRefusee()
    }
    lire()
    return abonnerOppositionMesure(lire)
  })

  return {
    get refusee() {
      return refusee
    },
    changer: changerOppositionMesure,
  }
}
