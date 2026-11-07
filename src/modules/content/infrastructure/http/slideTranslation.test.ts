import { toSlide } from './slideTranslation'

const IMAGE = {
  alt: 'Pompons rouges d’un calliandra',
  width: 1280,
  height: 720,
  sources: [{ type: 'image/avif' as const, srcset: 'http://api.test/media/c-640.avif 640w' }],
  src: 'http://api.test/media/c-640.webp',
}

describe('toSlide', () => {
  it('identifie la diapositive par son slug et garde l’image de l’API telle quelle', () => {
    expect(
      toSlide({
        id: 3,
        slug: 'calliandra',
        title: 'Calliandra',
        text: 'Des pompons.',
        image: IMAGE,
      }),
    ).toEqual({ id: 'calliandra', title: 'Calliandra', text: 'Des pompons.', image: IMAGE })
  })
})
