/** Cloudflare Worker server runtime. Never import this into browser code. */
import { accessConfigured, verifyStaffAccess } from './access'
import type { AccessEnv } from './access'
import { searchServiceM8Customers, serviceM8Connection } from './servicem8'

export interface WorkerEnv extends AccessEnv {
  ASSETS: { fetch(request: Request): Promise<Response> }
  /** Secret: Cloudflare runtime only, NEVER a VITE_ variable. */
  SERVICEM8_API_KEY?: string
}

function json(
  body: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...headers,
    },
  })
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url)
    const { pathname } = url
    if (pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'Method not allowed' }, 405, {
          Allow: 'GET, HEAD',
        })
      }
      const response = json({ status: 'ok', service: 'WhitfieldOS API' })
      return request.method === 'HEAD'
        ? new Response(null, {
            status: response.status,
            headers: response.headers,
          })
        : response
    }

    if (
      pathname === '/api/servicem8/status' ||
      pathname === '/api/servicem8/customers'
    ) {
      if (request.method !== 'GET')
        return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
      // Never contact ServiceM8 unless BOTH verified staff identity and
      // a configured Access audience are present.
      if (!accessConfigured(env))
        return json({ error: 'staff_access_not_configured' }, 503)
      if (!(await verifyStaffAccess(request, env)))
        return json({ error: 'staff_sign_in_required' }, 401)
      if (pathname === '/api/servicem8/status') {
        const result = await serviceM8Connection(env)
        return result.ok
          ? json(result.data)
          : json({ error: result.code }, result.status)
      }
      const name = url.searchParams.get('name') || ''
      const result = await searchServiceM8Customers(env, name)
      return result.ok
        ? json(result.data)
        : json({ error: result.code }, result.status)
    }

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      // No arbitrary upstream URLs, open CORS, provider proxy or API-key response.
      return json({ error: 'API endpoint not available' }, 404)
    }
    return env.ASSETS.fetch(request)
  },
}
