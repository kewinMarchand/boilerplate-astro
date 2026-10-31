// Image d'une carte produit : partagée par la carte et par le préchargement du premier produit (LCP).
export const PRODUCT_IMAGE = {
  widths: [400, 800],
  sizes: '(min-width: 1024px) 300px, (min-width: 536px) calc(50vw - 36px), calc(100vw - 32px)',
  basePath: (image: number) => `/images/product-${image}`,
}
