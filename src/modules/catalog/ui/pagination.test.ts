import { paginationWindow } from './pagination'

describe('paginationWindow', () => {
  it('affiche toutes les pages jusqu’à 7', () => {
    expect(paginationWindow(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('insère des ellipses au-delà de 7 pages', () => {
    expect(paginationWindow(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
    expect(paginationWindow(1, 10)).toEqual([1, 2, 'ellipsis', 10])
    expect(paginationWindow(10, 10)).toEqual([1, 'ellipsis', 9, 10])
  })
})
