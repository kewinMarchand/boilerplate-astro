import type { ImageView } from '@/shared/ui/kit'

export declare namespace Slide {
  interface Entity {
    id: string
    title: string
    text: string
    image: ImageView | null
  }

  type Carousel = { status: 'success'; slides: Entity[] } | { status: 'error'; message: string }
}
