<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte'

  import { Button, Icon, ResponsiveImage } from '@/shared/ui/kit'

  import { CAROUSEL_OPTIONS, useCarousel } from './hooks/useCarousel.svelte'

  import type { Carousel } from './carousel'

  interface Props {
    slides: Carousel.Slide[]
    label: string
  }

  const { slides, label }: Props = $props()

  const viewportId = $props.id()
  const carousel = useCarousel()
</script>

<div role="region" aria-roledescription="carrousel" aria-label={label}>
  <!-- Piste focusable : sans JavaScript, elle ne se défile pas au clavier autrement (axe scrollable-region-focusable). -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    id={viewportId}
    class="carousel-viewport"
    tabindex="0"
    data-embla-ready={carousel.ready ? '' : undefined}
    use:emblaCarouselSvelte={{ options: CAROUSEL_OPTIONS, plugins: [] }}
    onemblaInit={(event) => carousel.init(event.detail)}
  >
    <div class="carousel-track">
      {#each slides as slide, position (slide.id)}
        <div
          class="carousel-slide"
          role="group"
          aria-roledescription="diapositive"
          aria-label={`${position + 1} sur ${slides.length}`}
          data-testid="carousel-slide"
        >
          {#if slide.image}
            <ResponsiveImage
              image={slide.image}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              class="aspect-video h-auto w-full rounded-md object-cover"
            />
          {/if}
          <h3 class="mt-3 text-title font-semibold">{slide.title}</h3>
          <p class="text-text-muted">{slide.text}</p>
        </div>
      {/each}
    </div>
  </div>
  <div class="mt-4 flex flex-wrap items-center gap-2">
    <Button
      type="button"
      variant="outline"
      aria-controls={viewportId}
      disabled={!carousel.canPrevious}
      onclick={carousel.previous}
      icon="chevron-left"
      data-testid="carousel-prev"
    >
      Précédent
    </Button>
    <Button
      type="button"
      variant="outline"
      aria-controls={viewportId}
      disabled={!carousel.canNext}
      onclick={carousel.next}
      data-testid="carousel-next"
    >
      Suivant
      <Icon name="chevron-right" />
    </Button>
    {#if carousel.snapCount > 1}
      <div class="flex flex-wrap">
        {#each { length: carousel.snapCount }, index (index)}
          <button
            type="button"
            class="carousel-dot"
            aria-label={`Aller à la diapositive ${index + 1}`}
            aria-controls={viewportId}
            aria-current={index === carousel.selected ? 'true' : undefined}
            onclick={() => carousel.goTo(index)}
            data-testid="carousel-dot"
          ></button>
        {/each}
      </div>
    {/if}
  </div>
</div>
