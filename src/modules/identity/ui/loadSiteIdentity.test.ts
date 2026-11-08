import { SITE_IDENTITY_FALLBACK } from '@/shared/config'

import { findSiteIdentity } from '../infrastructure/siteIdentityRepository'
import { loadSiteIdentity } from './loadSiteIdentity'

vi.mock('../infrastructure/siteIdentityRepository', () => ({ findSiteIdentity: vi.fn() }))

describe('loadSiteIdentity', () => {
  it('renvoie l’identité lue dans l’API', async () => {
    const identity = { ...SITE_IDENTITY_FALLBACK, name: 'Oraki' }
    vi.mocked(findSiteIdentity).mockResolvedValueOnce(identity)

    expect(await loadSiteIdentity()).toEqual(identity)
  })

  it('se replie sur la configuration du site si l’API échoue', async () => {
    vi.mocked(findSiteIdentity).mockRejectedValueOnce(new Error('panne'))

    const identity = await loadSiteIdentity()
    expect(identity).toEqual(SITE_IDENTITY_FALLBACK)
    expect(identity.salesEnabled).toBe(true)
  })
})
