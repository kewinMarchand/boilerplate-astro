import { findPageMetas } from '../infrastructure/siteIdentityRepository'
import { loadPageMetas } from './loadPageMetas'

vi.mock('../infrastructure/siteIdentityRepository', () => ({ findPageMetas: vi.fn() }))

describe('loadPageMetas', () => {
  it('renvoie les métadonnées lues dans l’API', async () => {
    const metas = { blog: { title: '', description: 'Conseils et actualités.' } }
    vi.mocked(findPageMetas).mockResolvedValueOnce(metas)

    expect(await loadPageMetas()).toEqual(metas)
  })

  it('n’en renvoie aucune si l’API échoue', async () => {
    vi.mocked(findPageMetas).mockRejectedValueOnce(new Error('panne'))

    expect(await loadPageMetas()).toEqual({})
  })
})
