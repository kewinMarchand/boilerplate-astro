export const responsiveSrcset = (basePath: string, widths: number[], format: 'avif' | 'webp') =>
  widths.map((width) => `${basePath}-${width}.${format} ${width}w`).join(', ')
