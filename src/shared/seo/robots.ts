import { absoluteUrl } from './buildPageMeta'

export const buildRobotsTxt = () =>
  ['User-Agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n')
