/** Centimes affichés en euros dans la langue de la page (`tag` BCP 47 : « 34,90 € », « €34.90 »). */
export const formatPrice = (cents: number, tag: string) =>
  new Intl.NumberFormat(tag, { style: 'currency', currency: 'EUR' }).format(cents / 100)
