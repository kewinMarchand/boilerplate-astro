/** Date de publication dans la langue `tag` (BCP 47) : « 12 mars 2026 », « March 12, 2026 ». */
export const formatPublishedAt = (isoDate: string, tag: string) =>
  new Intl.DateTimeFormat(tag, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(isoDate))
