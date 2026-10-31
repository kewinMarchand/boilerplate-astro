// Routes de développement (charte graphique, déclencheur de 500) : absentes en production,
// sauf DEV_ROUTES=1 (tests e2e sur le build de production).
export const areDevRoutesEnabled = () => import.meta.env.DEV || process.env['DEV_ROUTES'] === '1'
