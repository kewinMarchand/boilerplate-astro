import { afterEach, describe, expect, it, vi } from 'vitest'

import { abonnerOppositionMesure, changerOppositionMesure, mesureRefusee } from './oppositionMesure'

afterEach(() => window.localStorage.clear())

describe('opposition à la mesure d’audience', () => {
  it('est absente par défaut', () => {
    expect(mesureRefusee()).toBe(false)
  })

  it('se pose, se retire, et prévient les abonnés à chaque changement', () => {
    const rappel = vi.fn()
    const desabonner = abonnerOppositionMesure(rappel)

    changerOppositionMesure(true)
    expect(mesureRefusee()).toBe(true)
    changerOppositionMesure(false)
    expect(mesureRefusee()).toBe(false)
    expect(rappel).toHaveBeenCalledTimes(2)

    desabonner()
    changerOppositionMesure(true)
    expect(rappel).toHaveBeenCalledTimes(2)
  })
})
