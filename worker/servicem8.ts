/** Strictly read-only, fixed-destination ServiceM8 requests. */
export interface ServiceM8Env {
  SERVICEM8_API_KEY?: string
}
const BASE_URL = 'https://api.servicem8.com/api_1.0/'

type Result<T> = { ok: true; data: T } | { ok: false; status: number; code: string }

async function readServiceM8<T>(
  env: ServiceM8Env,
  resource: 'vendor.json' | 'company.json',
  params?: URLSearchParams,
): Promise<Result<T>> {
  const key = env.SERVICEM8_API_KEY
  if (!key || !key.trim()) return { ok: false, status: 503, code: 'api_key_not_configured' }
  const url = BASE_URL + resource + (params ? '?' + params.toString() : '')
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      headers: {
        'X-API-Key': key,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403)
        return { ok: false, status: 502, code: 'servicem8_key_rejected' }
      if (response.status === 429)
        return { ok: false, status: 503, code: 'servicem8_rate_limited' }
      return { ok: false, status: 502, code: 'servicem8_unavailable' }
    }
    const body = await response.json() as unknown
    if (!Array.isArray(body)) return { ok: false, status: 502, code: 'invalid_servicem8_response' }
    return { ok: true, data: body as T }
  } catch {
    return { ok: false, status: 502, code: 'servicem8_unavailable' }
  }
}

export async function serviceM8Connection(env: ServiceM8Env) {
  const result = await readServiceM8<Array<{ name?: unknown }>>(env, 'vendor.json')
  if (!result.ok) return result
  const vendor = result.data.find((item) => item && typeof item === 'object')
  return { ok: true as const, data: {
    connected: true,
    account: typeof vendor?.name === 'string' ? vendor.name.slice(0, 120) : 'ServiceM8 account',
  } }
}

export async function searchServiceM8Customers(env: ServiceM8Env, input: string) {
  const name = input.trim()
  if (name.length < 3 || name.length > 100 || /[\u0000-\u001f]/.test(name))
    return { ok: false as const, status: 400, code: 'invalid_customer_name' }
  // Strict exact-match search. No list-all operation or arbitrary API proxy.
  const safeName = name.replace(/'/g, "''")
  const params = new URLSearchParams({ '$filter': "name eq '" + safeName + "' and active eq 1" })
  const result = await readServiceM8<Array<Record<string, unknown>>>(env, 'company.json', params)
  if (!result.ok) return result
  const matches = result.data
    .filter((item) => !!item && typeof item === 'object' && !Array.isArray(item))
    .slice(0, 20)
    .map((item) => ({
      uuid: typeof item.uuid === 'string' && /^[a-f0-9-]{36}$/i.test(item.uuid) ? item.uuid : '',
      name: typeof item.name === 'string' ? item.name.slice(0, 120) : '',
      address: typeof item.address === 'string' ? item.address.slice(0, 250) : '',
    }))
    .filter((client) => !!client.uuid && !!client.name)
  return { ok: true as const, data: { matches } }
}
