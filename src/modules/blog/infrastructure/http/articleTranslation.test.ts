import { toArticle, toArticleDetail } from './articleTranslation'

const DTO = {
  id: 2,
  slug: 'un-carrousel-accessible',
  title: 'Un carrousel accessible',
  excerpt: 'Défilement natif.',
  publishedAt: '2026-09-22',
  image: null,
  section: null,
  format: null,
  audio: null,
  speaker: '',
}

describe('toArticle', () => {
  it('sans rubrique, format ni audio', () => {
    expect(toArticle(DTO)).toMatchObject({
      id: '2',
      section: null,
      format: null,
      audio: null,
      speaker: '',
    })
  })

  it('reprend rubrique, format, audio et intervenant', () => {
    const article = toArticle({
      ...DTO,
      section: { slug: 'conseils', name: 'Conseils' },
      format: { slug: 'guide', name: 'Guide' },
      audio: { src: 'https://api/media/bip.mp3', type: 'audio/mpeg', durationSeconds: 4 },
      speaker: ' Présenté par Hina ',
    })

    expect(article).toMatchObject({
      section: { slug: 'conseils', name: 'Conseils' },
      format: { slug: 'guide', name: 'Guide' },
      audio: { src: 'https://api/media/bip.mp3', type: 'audio/mpeg', durationSeconds: 4 },
      speaker: 'Présenté par Hina',
    })
  })
})

describe('toArticleDetail', () => {
  const DETAIL = { ...DTO, html: '<p>Texte</p>', metaTitle: '', metaDescription: '' }

  it('garde des métadonnées vides quand rien n’est saisi', () => {
    expect(toArticleDetail(DETAIL)).toMatchObject({ metaTitle: '', metaDescription: '' })
  })

  it('reprend titre et description saisis', () => {
    expect(
      toArticleDetail({ ...DETAIL, metaTitle: ' Carrousel ', metaDescription: 'Sans dépendance.' }),
    ).toMatchObject({ metaTitle: 'Carrousel', metaDescription: 'Sans dépendance.' })
  })
})
