<script lang="ts">
  import { onMount } from 'svelte'

  import { largestWebp, ResponsiveImage } from '@/shared/ui/kit'

  import type { ImageView } from '@/shared/ui/kit'

  interface Props {
    /** Image principale puis galerie, dans l'ordre. */
    images: ImageView[]
    sizes: string
  }

  const { images, sizes }: Props = $props()
  let current = $state(0)
  // Sans JavaScript, les vignettes restent des liens vers l'image en grand ; hydratées, des boutons.
  let enhanced = $state(false)
  const thumbs: HTMLButtonElement[] = $state([])
  const shown = $derived(images[current])

  onMount(() => {
    enhanced = true
  })

  const onKeydown = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    current = (index + step + images.length) % images.length
    thumbs[current]?.focus()
  }

  const thumbLabel = (index: number) => `Voir l'image ${index + 1} sur ${images.length}`
  const THUMB_CLASS =
    'block size-16 overflow-hidden rounded-md border-2 border-transparent aria-[current=true]:border-primary'
</script>

{#snippet thumbImage(image: ImageView)}
  <ResponsiveImage image={{ ...image, alt: '' }} sizes="64px" class="size-full object-cover" />
{/snippet}

<div class="flex flex-col gap-3" data-testid="product-gallery">
  {#if shown}
    <div data-testid="product-gallery-main">
      <ResponsiveImage
        image={shown}
        {sizes}
        priority
        class="aspect-square h-auto w-full rounded-md object-cover"
      />
    </div>
  {/if}
  <ul class="flex flex-wrap gap-2">
    {#each images as image, index (image.src)}
      <li>
        {#if enhanced}
          <button
            type="button"
            bind:this={thumbs[index]}
            class={THUMB_CLASS}
            aria-label={thumbLabel(index)}
            aria-current={index === current ? 'true' : undefined}
            data-testid="product-gallery-thumb"
            onclick={() => (current = index)}
            onkeydown={(event) => onKeydown(event, index)}
          >
            {@render thumbImage(image)}
          </button>
        {:else}
          <a
            href={largestWebp(image)}
            class={THUMB_CLASS}
            aria-label={thumbLabel(index)}
            aria-current={index === current ? 'true' : undefined}
            data-testid="product-gallery-thumb"
          >
            {@render thumbImage(image)}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
</div>
