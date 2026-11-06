/** Server-side runtime. Never import this module into the browser application. */
export interface WorkerEnv {
  ASSETS: { fetch(request: Request): Promise<Response> }
  /** Cloudflare runtime secret; never a VITE_ variable or browser setting. */
  SERVICEM8_API_KEY?: string
}

function json(body: Record<string, string>, status = 200, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url)
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
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      // Do not serve the SPA, credentials or a public provider proxy here.
      // Customer endpoints need verified staff authentication before release.
      return json({ error: 'API endpoint not available' }, 404)
    }
    return env.ASSETS.fetch(request)
  },
}
