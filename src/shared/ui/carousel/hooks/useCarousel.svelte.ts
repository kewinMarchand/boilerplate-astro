import { isEnhancedModeActive } from '@/shared/ui/a11y-mode'

import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const shouldReduceMotion = () =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches || isEnhancedModeActive()

export const CAROUSEL_OPTIONS: EmblaOptionsType = { align: 'start', containScroll: 'trimSnaps' }

export const useCarousel = () => {
  let embla = $state<EmblaCarouselType | null>(null)
  let selected = $state(0)
  let snapCount = $state(0)
  let canPrevious = $state(false)
  let canNext = $state(false)

  const sync = (api: EmblaCarouselType) => {
    selected = api.selectedScrollSnap()
    snapCount = api.scrollSnapList().length
    canPrevious = api.canScrollPrev()
    canNext = api.canScrollNext()
  }

  return {
    get ready() {
      return embla !== null
    },
    get selected() {
      return selected
    },
    get snapCount() {
      return snapCount
    },
    get canPrevious() {
      return canPrevious
    },
    get canNext() {
      return canNext
    },
    init(api: EmblaCarouselType) {
      embla = api
      if (shouldReduceMotion()) api.reInit({ ...CAROUSEL_OPTIONS, duration: 10 })
      sync(api)
      api.on('select', sync).on('reInit', sync)
    },
    previous() {
      embla?.scrollPrev(shouldReduceMotion())
    },
    next() {
      embla?.scrollNext(shouldReduceMotion())
    },
    goTo(index: number) {
      embla?.scrollTo(index, shouldReduceMotion())
    },
  }
}
