export interface MatomoConfig {
  scriptUrl: string
  trackerUrl: string
  siteId: string
}

export type MatomoCommand = [name: string, ...values: string[]]

/** Sans URL ni identifiant de site, la mesure d'audience est éteinte : aucun script, aucune requête. */
export const matomoConfig = (
  url: string | undefined,
  siteId: string | undefined,
): MatomoConfig | null => {
  if (!url || !siteId) return null
  const base = url.endsWith('/') ? url : `${url}/`
  return { scriptUrl: `${base}matomo.js`, trackerUrl: `${base}matomo.php`, siteId }
}

/** Sans cookie, donc sans bandeau : `disableCookies` passe avant toute autre commande. */
export const setupCommands = (config: MatomoConfig): MatomoCommand[] => [
  ['disableCookies'],
  ['setTrackerUrl', config.trackerUrl],
  ['setSiteId', config.siteId],
]

export const pageViewCommands = ({
  url,
  title,
  referrer,
}: {
  url: string
  title: string
  referrer: string | undefined
}): MatomoCommand[] => [
  ...(referrer ? [['setReferrerUrl', referrer] satisfies MatomoCommand] : []),
  ['setCustomUrl', url],
  ['setDocumentTitle', title],
  ['trackPageView'],
]
