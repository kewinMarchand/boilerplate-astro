import { findSlides } from '../infrastructure/slideRepository'
import { loadFeaturedSlides } from './loadFeaturedSlides'

vi.mock('../infrastructure/slideRepository', () => ({ findSlides: vi.fn() }))

const HELICONIA = {
  id: 'heliconia',
  title: 'Heliconia',
  text: 'Des bractées rouges et jaunes.',
  imageBasePath: '/images/slide-1',
}

describe('loadFeaturedSlides', () => {
  it('renvoie les diapositives dans l’ordre de l’API', async () => {
    vi.mocked(findSlides).mockResolvedValueOnce([HELICONIA])

    expect(await loadFeaturedSlides()).toEqual({ status: 'success', slides: [HELICONIA] })
  })

  it('renvoie une liste vide quand l’API n’a aucune diapositive', async () => {
    vi.mocked(findSlides).mockResolvedValueOnce([])

    expect(await loadFeaturedSlides()).toEqual({ status: 'success', slides: [] })
  })

  it('transforme un échec de l’API en message affichable', async () => {
    vi.mocked(findSlides).mockRejectedValueOnce(new Error('panne'))

    expect(await loadFeaturedSlides()).toEqual({
      status: 'error',
      message: 'Impossible de charger le carrousel pour le moment.',
    })
  })
})
