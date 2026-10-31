const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' })

export const formatPublishedAt = (isoDate: string) => DATE_FORMAT.format(new Date(isoDate))
