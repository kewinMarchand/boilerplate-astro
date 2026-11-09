<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte'

  import { format } from '@/shared/i18n'
  import { Button, Icon, ResponsiveImage } from '@/shared/ui/kit'

  import { CAROUSEL_OPTIONS, useCarousel } from './hooks/useCarousel.svelte'

  import type { Carousel } from './carousel'

  interface Props {
    slides: Carousel.Slide[]
    label: string
    /** Libellés dans la langue de la page (`carousel` du dictionnaire). */
    labels: {
      roleDescription: string
      slideRoleDescription: string
      position: string
      previous: string
      next: string
      goTo: string
    }
  }

  const { slides, label, labels }: Props = $props()

  const viewportId = $props.id()
  const carousel = useCarousel()
</script>

<div role="region" aria-roledescription={labels.roleDescription} aria-label={label}>
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
          aria-roledescription={labels.slideRoleDescription}
          aria-label={format(labels.position, { position: position + 1, total: slides.length })}
          data-testid="carousel-slide"
        >
          {#if slide.image}
            <ResponsiveImage
              image={slide.image}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              pictureClass="rounded-md"
              class="h-auto w-full rounded-md object-cover"
            />
          {/if}
          <h3 class="mt-3 text-title font-semibold">
            {#if slide.href}
              <!-- Après un glisser, Embla annule le clic : la diapositive ne s'ouvre pas en fin de geste -->
              <a
                href={slide.href}
                draggable="false"
                class="bui-link carousel-link"
                data-testid="carousel-slide-link">{slide.title}</a
              >
            {:else}
              {slide.title}
            {/if}
          </h3>
          {#if slide.text}
            <p class="text-text-muted">{slide.text}</p>
          {/if}
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
      {labels.previous}
    </Button>
    <Button
      type="button"
      variant="outline"
      aria-controls={viewportId}
      disabled={!carousel.canNext}
      onclick={carousel.next}
      data-testid="carousel-next"
    >
      {labels.next}
      <Icon name="chevron-right" />
    </Button>
    {#if carousel.snapCount > 1}
      <div class="flex flex-wrap">
        {#each { length: carousel.snapCount }, index (index)}
          <button
            type="button"
            class="carousel-dot"
            aria-label={format(labels.goTo, { position: index + 1 })}
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

<style>
  .carousel-slide {
    position: relative;
  }

  /* Lien étiré sur toute la diapositive : un seul lien, nommé par le titre */
  .carousel-link::after {
    position: absolute;
    inset: 0;
    content: '';
  }
</style>
