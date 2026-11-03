export declare namespace Slide {
  interface Entity {
    id: string
    title: string
    text: string
    imageBasePath: string
  }

  type Carousel = { status: 'success'; slides: Entity[] } | { status: 'error'; message: string }
}
