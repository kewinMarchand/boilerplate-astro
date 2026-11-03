import { findLegalPage } from '../infrastructure/legalPageRepository'
import { loadLegalPage } from './loadLegalPage'

vi.mock('../infrastructure/legalPageRepository', () => ({ findLegalPage: vi.fn() }))

const PAGE = {
  title: 'Données personnelles',
  introduction: '',
  sections: [{ title: 'Vos droits', html: '<ul><li>accès ;</li></ul>' }],
}

describe('loadLegalPage', () => {
  it('renvoie la page lue dans l’API', async () => {
    vi.mocked(findLegalPage).mockResolvedValueOnce(PAGE)

    expect(await loadLegalPage('donnees-personnelles')).toEqual({ status: 'success', page: PAGE })
    expect(findLegalPage).toHaveBeenCalledWith('donnees-personnelles')
  })

  it('déclare introuvable une page que l’API ne connaît pas', async () => {
    vi.mocked(findLegalPage).mockResolvedValueOnce(null)

    expect(await loadLegalPage('accessibilite')).toEqual({ status: 'not-found' })
  })

  it('transforme un échec de l’API en message affichable', async () => {
    vi.mocked(findLegalPage).mockRejectedValueOnce(new Error('panne'))

    expect(await loadLegalPage('mentions-legales')).toEqual({
      status: 'error',
      message: 'Impossible de charger cette page pour le moment. Réessayez dans quelques minutes.',
    })
  })
})
