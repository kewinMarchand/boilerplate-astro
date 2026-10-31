import { SITE } from '@/shared/config'

export const MAINTENANCE_RETRY_AFTER_SECONDS = 3600

export const MAINTENANCE_HTML = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Site en maintenance · ${SITE.name}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; font: 16px/1.6 system-ui, sans-serif; color: #111827; background: #ffffff; }
      main { max-width: 40rem; padding: 24px; }
      h1 { font-size: 32px; line-height: 1.2; margin: 0 0 16px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Site en maintenance</h1>
      <p>${SITE.name} fait l’objet d’une opération de maintenance. Le service revient dans quelques instants, merci de votre patience.</p>
    </main>
  </body>
</html>
`
