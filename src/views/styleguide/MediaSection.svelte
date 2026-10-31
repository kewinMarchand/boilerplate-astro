<script lang="ts">
  import { ResponsiveImage } from '@/shared/ui/kit'

  import { BlogCard } from '@/modules/blog'
  import { eurosToCents, ProductCard } from '@/modules/catalog'

  import Section from './Section.svelte'

  const ARTICLE = {
    id: 'exemple',
    title: 'Carte de blog',
    excerpt: 'Illustration, titre, date de publication et extrait.',
    imageBasePath: '/images/blog-1',
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
    image: 1,
  } as const
</script>

<Section id="medias" title="Médias et cartes">
  <div class="blog-grid mb-6">
    <BlogCard article={ARTICLE} />
    <ProductCard product={{ ...PRODUCT }} />
  </div>
  <ul class="catalog-grid mb-6" data-view="liste">
    <li><ProductCard product={{ ...PRODUCT, name: 'Carte produit en liste' }} /></li>
  </ul>
  <div class="max-w-prose">
    <ResponsiveImage
      basePath="/images/slide-1"
      widths={[640, 1280]}
      sizes="(min-width: 768px) 720px, 100vw"
      width={1280}
      height={720}
      alt="Heliconia en fleur, image au ratio 16:9"
      class="aspect-video h-auto w-full rounded-md object-cover"
    />
  </div>
</Section>
