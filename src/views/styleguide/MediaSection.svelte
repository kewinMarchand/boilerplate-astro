<script lang="ts">
  import { ResponsiveImage, staticImage } from '@/shared/ui/kit'

  import { BlogCard } from '@/modules/blog'
  import { eurosToCents, ProductCard } from '@/modules/catalog'

  import Section from './Section.svelte'

  import type { Dictionary } from '@/shared/i18n'

  interface Props {
    cardLabels: Pick<Dictionary, 'catalog' | 'language'>
  }

  const { cardLabels }: Props = $props()

  /** Photo du site : la charte graphique est statique, elle ne lit pas l'API. */
  const PHOTO = staticImage('/images/hero', [640, 1280], {
    width: 1280,
    height: 720,
    alt: 'Jardin tropical, image au ratio 16:9',
  })

  const ARTICLE = {
    id: 'exemple',
    slug: 'exemple',
    title: 'Carte de blog',
    excerpt: 'Illustration, titre, date de publication et extrait.',
    image: { ...PHOTO, alt: '' },
    publishedAt: '2026-10-01',
  }

  const PRODUCT = {
    id: 'exemple',
    slug: 'exemple',
    name: 'Carte produit',
    categorySlug: 'monstera',
    price: eurosToCents(34.9),
    exposure: 'mi-ombre',
    size: 'L',
    inStock: false,
    image: null,
  } as const
</script>

<Section id="medias" title="Médias et cartes">
  <div class="blog-grid mb-6">
    <BlogCard article={ARTICLE} tag={cardLabels.language.tag} />
    <ProductCard product={{ ...PRODUCT }} t={cardLabels} />
  </div>
  <ul class="catalog-grid mb-6" data-view="liste">
    <li><ProductCard product={{ ...PRODUCT, name: 'Carte produit en liste' }} t={cardLabels} /></li>
  </ul>
  <div class="max-w-prose">
    <ResponsiveImage
      image={PHOTO}
      sizes="(min-width: 768px) 720px, 100vw"
      pictureClass="rounded-md"
      class="aspect-video h-auto w-full rounded-md object-cover"
    />
  </div>
</Section>
