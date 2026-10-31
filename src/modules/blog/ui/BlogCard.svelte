<script lang="ts">
  import { ResponsiveImage } from '@/shared/ui/kit'

  import { formatPublishedAt } from '../domain/formatPublishedAt'

  import type { Article } from '../domain/article'

  interface Props {
    article: Article.Entity
  }

  const { article }: Props = $props()
</script>

<article class="bui-card" data-testid="home-blog-card">
  <div class="bui-card__media">
    <ResponsiveImage
      basePath={article.imageBasePath}
      widths={[480, 960]}
      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      width={960}
      height={540}
      alt=""
      class="aspect-video h-auto w-full object-cover"
    />
  </div>
  <div class="bui-card__body">
    <h3 class="bui-card__title">{article.title}</h3>
    <time datetime={article.publishedAt} class="text-body-sm text-text-muted">
      {formatPublishedAt(article.publishedAt)}
    </time>
    <p>{article.excerpt}</p>
  </div>
</article>
