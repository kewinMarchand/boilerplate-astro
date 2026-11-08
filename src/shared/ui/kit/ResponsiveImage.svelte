<script lang="ts">
  import type { ImageView } from './image'
  import type { ClassValue } from 'svelte/elements'

  interface Props {
    image: ImageView
    sizes: string
    priority?: boolean
    eager?: boolean
    fetchPriority?: 'high' | 'low' | 'auto'
    class?: string
    /** Fond de remplacement si l'image échoue (`bui-picture`) : images de l'API, pas le logo. */
    fallback?: boolean
    pictureClass?: ClassValue
  }

  const {
    image,
    sizes,
    priority = false,
    eager = false,
    fetchPriority = priority ? 'high' : 'auto',
    class: className,
    fallback = true,
    pictureClass,
  }: Props = $props()
</script>

<picture class={[fallback && 'bui-picture', pictureClass]}>
  {#each image.sources as source (source.type)}
    <source type={source.type} srcset={source.srcset} {sizes} />
  {/each}
  <img
    src={image.src}
    alt={image.alt}
    width={image.width}
    height={image.height}
    loading={priority || eager ? 'eager' : 'lazy'}
    fetchpriority={fetchPriority}
    decoding={priority ? 'sync' : 'async'}
    class={className}
  />
</picture>
