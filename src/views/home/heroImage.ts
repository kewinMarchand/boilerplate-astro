// Image LCP de l'accueil : préchargée dans le <head> (HomeView) et affichée par le hero.
import { staticImage } from '@/shared/ui/kit'

export const HERO_IMAGE = {
  image: staticImage('/images/hero', [640, 960, 1280, 1920], {
    width: 1920,
    height: 1080,
    alt: '',
  }),
  sizes: '100vw',
}
