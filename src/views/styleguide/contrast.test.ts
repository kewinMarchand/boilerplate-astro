import { contrastLevel, contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('vaut 21 entre le noir et le blanc', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('vaut 1 entre deux couleurs identiques et accepte la forme courte', () => {
    expect(contrastRatio('#fff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('calcule le ratio du primaire sur blanc', () => {
    expect(contrastRatio('#1d4ed8', '#ffffff')).toBeCloseTo(6.7, 1)
  })

  it('renvoie null pour une valeur non hexadécimale', () => {
    expect(contrastRatio('oklch(0.5 0.1 200)', '#ffffff')).toBeNull()
  })
})

describe('contrastLevel', () => {
  it('classe selon les seuils WCAG du texte normal', () => {
    expect(contrastLevel(7)).toBe('AAA')
    expect(contrastLevel(4.5)).toBe('AA')
    expect(contrastLevel(4.49)).toBe('insuffisant')
  })
})
