import { formatDuration, isoDuration } from './formatDuration'

describe('formatDuration', () => {
  it.each([
    [4, '4 s'],
    [59, '59 s'],
    [60, '1 min'],
    [1560, '26 min'],
    [3570, '1 h 00 min'],
    [3900, '1 h 05 min'],
  ])('%i secondes : %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})

describe('isoDuration', () => {
  it('exprime la durée en secondes', () => {
    expect(isoDuration(1560)).toBe('PT1560S')
  })
})
