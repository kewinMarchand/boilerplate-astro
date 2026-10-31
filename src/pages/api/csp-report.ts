import { cspReportHandler } from '@/shared/security/index.server'

import type { APIRoute } from 'astro'

export const POST: APIRoute = ({ request }) => cspReportHandler(request)
