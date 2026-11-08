import { toPageMetas } from './pageMetasTranslation'

describe('toPageMetas', () => {
  it('indexe titres et descriptions par page, chaînes vides comprises', () => {
    expect(
      toPageMetas([
        { page: 'home', title: '', description: '' },
        { page: 'blog', title: ' Le blog ', description: 'Conseils et actualités.' },
      ]),
    ).toEqual({
      home: { title: '', description: '' },
      blog: { title: 'Le blog', description: 'Conseils et actualités.' },
    })
  })
})
