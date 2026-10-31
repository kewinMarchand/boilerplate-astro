// svgstore ne publie pas de types : seulement ce que tools/icons.ts utilise.
declare module 'svgstore' {
  interface Sprite {
    add(id: string, svg: string): Sprite
    toString(options?: { inline?: boolean }): string
  }

  export default function svgstore(options?: { svgAttrs?: Record<string, string> }): Sprite
}
