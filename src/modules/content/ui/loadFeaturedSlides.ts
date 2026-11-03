import { findSlides } from '../infrastructure/slideRepository'
import { SlidesLoadError } from '../infrastructure/SlidesLoadError'

import type { Slide } from '../domain/slide'

/** Diapositives du carrousel de l'accueil, rendues côté serveur : échec de l'API traduit en état d'erreur. */
export const loadFeaturedSlides = async (): Promise<Slide.Carousel> => {
  try {
    return { status: 'success', slides: await findSlides() }
  } catch {
    return { status: 'error', message: new SlidesLoadError().message }
  }
}
