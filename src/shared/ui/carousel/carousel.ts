import type { AppPath } from '@/shared/routing'
import type { ImageView } from '@/shared/ui/kit'

export declare namespace Carousel {
  interface Slide {
    id: string
    image: ImageView | null
    title: string
    text: string
    /** Destination de la diapositive : son titre devient un lien étiré sur toute la diapositive. */
    href?: AppPath
  }
}
