<script lang="ts">
  import { Alert, Button, Icon, Skeleton } from '@/shared/ui/kit'

  import BlogCard from './BlogCard.svelte'

  import type { Article } from '../domain/article'
  import type { Dictionary } from '@/shared/i18n'

  interface Props {
    status: Article.Status
    articles: Article.Entity[] | undefined
    /** Rendu serveur sans hydratation : la relance recharge la page. */
    retryHref: string
    t: Pick<Dictionary, 'blog' | 'language'>
  }

  const { status, articles, retryHref, t }: Props = $props()
</script>

{#if status === 'pending'}
  <div
    class="blog-grid"
    role="status"
    aria-busy="true"
    aria-label={t.blog.loading}
    data-testid="home-blog-loading"
  >
    {#each [1, 2, 3] as key (key)}
      <Skeleton height="128px" />
    {/each}
  </div>
{:else if status === 'error'}
  <div class="flex flex-col items-start gap-3">
    <Alert variant="error" data-testid="home-blog-error">{t.blog.loadError}</Alert>
    <Button variant="outline" href={retryHref} data-testid="home-blog-retry"
      ><Icon name="rotate-cw" />{t.blog.retry}
    </Button>
  </div>
{:else if !articles?.length}
  <Alert variant="info" data-testid="home-blog-empty">
    {t.blog.empty}
  </Alert>
{:else}
  <div class="blog-grid">
    {#each articles as article, index (article.id)}
      <BlogCard {article} featured={index === 0} tag={t.language.tag} />
    {/each}
  </div>
{/if}
