import { toSlide } from './slideTranslation'

describe('toSlide', () => {
  it('identifie la diapositive par son slug et pointe vers le visuel livré dans le front', () => {
    expect(
      toSlide({ id: 3, slug: 'calliandra', title: 'Calliandra', text: 'Des pompons.', image: 3 }),
    ).toEqual({
      id: 'calliandra',
      title: 'Calliandra',
      text: 'Des pompons.',
      imageBasePath: '/images/slide-3',
    })
  })
})
