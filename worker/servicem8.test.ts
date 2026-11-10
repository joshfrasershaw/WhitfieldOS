import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchServiceM8Customers, serviceM8Connection } from './servicem8'

const env = { SERVICEM8_API_KEY: 'test-api-key-do-not-use' }
afterEach(() => vi.unstubAllGlobals())

describe('Server-side ServiceM8 private API', () => {
  it('tests the connection with a fixed account endpoint and never returns the key', async () => {
    const mock = vi.fn(async () => Response.json([{ name: 'Whitfield Plumbing' }]))
    vi.stubGlobal('fetch', mock)
    const result = await serviceM8Connection(env)
    expect(result).toEqual({ ok: true, data: { connected: true, account: 'Whitfield Plumbing' } })
    const [url, options] = mock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.servicem8.com/api_1.0/vendor.json')
    expect(options.method).toBe('GET')
    expect((options.headers as Record<string, string>)['X-API-Key']).toBe(env.SERVICEM8_API_KEY)
    expect(JSON.stringify(result)).not.toContain(env.SERVICEM8_API_KEY)
  })

  it('searches only an exact customer name, escapes apostrophes and limits exposed fields', async () => {
    const mock = vi.fn(async () => Response.json([
      { uuid: '01aba7f0-0000-4000-8000-000000000001', name: "O'Neil", address: 'Home', secret_notes: 'PRIVATE', mobile: '0123' },
    ]))
    vi.stubGlobal('fetch', mock)
    const result = await searchServiceM8Customers(env, " O'Neil ")
    expect(result).toEqual({ ok: true, data: { matches: [
      { uuid: '01aba7f0-0000-4000-8000-000000000001', name: "O'Neil", address: 'Home' },
    ] } })
    const [url] = mock.mock.calls[0] as unknown as [string]
    expect(new URL(url).searchParams.get('$filter')).toBe("name eq 'O''Neil' and active eq 1")
    expect(JSON.stringify(result)).not.toContain('PRIVATE')
  })

  it('refuses missing keys, malformed searches and upstream credentials errors', async () => {
    expect(await serviceM8Connection({})).toEqual({
      ok: false, status: 503, code: 'api_key_not_configured',
    })
    expect(await searchServiceM8Customers(env, '*')).toEqual({
      ok: false, status: 400, code: 'invalid_customer_name',
    })
    vi.stubGlobal('fetch', vi.fn(async () => new Response('invalid key: super-secret', { status: 401 })))
    const result = await serviceM8Connection(env)
    expect(result).toEqual({ ok: false, status: 502, code: 'servicem8_key_rejected' })
    expect(JSON.stringify(result)).not.toContain('super-secret')
  })
})
