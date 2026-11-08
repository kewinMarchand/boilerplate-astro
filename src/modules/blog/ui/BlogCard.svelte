<script lang="ts">
  import { ResponsiveImage } from '@/shared/ui/kit'

  import { articleHref } from '../domain/article'
  import { formatPublishedAt } from '../domain/formatPublishedAt'

  import type { Article } from '../domain/article'

  interface Props {
    article: Article.Entity
    /** Article à la une : plus large dès la tablette, son image remplit la hauteur des deux autres. */
    featured?: boolean
    testId?: 'home-blog-card' | 'blog-card'
    headingLevel?: 2 | 3
  }

  const { article, featured = false, testId = 'home-blog-card', headingLevel = 3 }: Props = $props()
</script>

<article class="bui-card relative" data-testid={testId}>
  {#if article.image}
    <div class={['bui-card__media', featured && 'md:relative md:aspect-video md:grow']}>
      <ResponsiveImage
        image={article.image}
        sizes={featured
          ? '(min-width: 1024px) 66vw, 100vw'
          : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
        class={[
          'aspect-video h-auto w-full object-cover',
          featured && 'md:absolute md:inset-0 md:h-full',
        ]}
      />
    </div>
  {/if}
  <div class={['bui-card__body', featured && 'md:grow-0']}>
    <svelte:element this={`h${headingLevel}`} class="bui-card__title">
      <a href={articleHref(article.slug)} class="blog-card-link">{article.title}</a>
    </svelte:element>
    <time datetime={article.publishedAt} class="text-body-sm text-text-muted">
      {formatPublishedAt(article.publishedAt)}
    </time>
    <p>{article.excerpt}</p>
  </div>
</article>

<style>
  /* Lien étiré sur toute la carte : un seul lien, nommé par le titre */
  .blog-card-link::after {
    content: '';
    position: absolute;
    inset: 0;
  }
</style>
