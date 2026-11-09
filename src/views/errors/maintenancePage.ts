import { SITE } from '@/shared/config'
import { format, localeContext } from '@/shared/i18n'
import { dictionaryFor } from '@/shared/i18n/index.server'

export const MAINTENANCE_RETRY_AFTER_SECONDS = 3600

/**
 * Page 503 autonome dans la langue de l'adresse (`path`) : son préfixe s'il désigne une autre langue activée,
 * sinon la langue par défaut du site (`locales`).
 */
export const maintenancePage = (path: string, locales: string[]) => {
  const context = localeContext(path, locales)
  const t = dictionaryFor(context).maintenance
  return `<!doctype html>
<html lang="${context.locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${t.title} · ${SITE.name}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font: 16px/1.6 system-ui, sans-serif; color: #111827; background: #ffffff; }
      main { max-width: 40rem; padding: 24px; }
      h1 { font-size: 32px; line-height: 1.2; margin: 0 0 16px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${t.title}</h1>
      <p>${format(t.text, { name: SITE.name })}</p>
    </main>
  </body>
</html>
`
}
