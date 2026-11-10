import { describe, expect, it, vi, afterEach } from 'vitest'
import { accessConfigured, verifyStaffAccess } from './access'

const env = {
  ACCESS_TEAM_DOMAIN: 'https://whitfield.cloudflareaccess.com',
  ACCESS_AUD: 'testaudience012345678901',
}

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')

async function createSignedToken(claimOverrides: Record<string, unknown> = {}) {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify'],
  )
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
  const now = Math.floor(Date.now() / 1000)
  const header = encode({ alg: 'RS256', typ: 'JWT', kid: 'whitfield-test-key' })
  const payload = encode({
    iss: env.ACCESS_TEAM_DOMAIN,
    aud: env.ACCESS_AUD,
    email: 'staff@example.com',
    exp: now + 300,
    iat: now,
    ...claimOverrides,
  })
  const signingInput = header + '.' + payload
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(signingInput),
  )
  return { token: signingInput + '.' + Buffer.from(signature).toString('base64url'), jwk: { ...jwk, kid: 'whitfield-test-key', use: 'sig', alg: 'RS256' } }
}

afterEach(() => vi.unstubAllGlobals())

describe('Cloudflare Access JWT verification', () => {
  it('requires valid configuration before trusting headers', () => {
    expect(accessConfigured(env)).toBe(true)
    expect(accessConfigured({ ...env, ACCESS_TEAM_DOMAIN: 'https://attacker.test' })).toBe(false)
    expect(accessConfigured({ ...env, ACCESS_AUD: '' })).toBe(false)
  })

  it('accepts only valid cryptographically signed staff tokens for the configured audience', async () => {
    const { token, jwk } = await createSignedToken()
    const fetchMock = vi.fn(async () => Response.json({ keys: [jwk] }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await verifyStaffAccess(new Request('https://example.test', { headers: { 'Cf-Access-Jwt-Assertion': token } }), env)).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      env.ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    )
  })

  it('rejects tampered, expired, wrong audience, wrong issuer and unsigned tokens', async () => {
    const valid = await createSignedToken()
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ keys: [valid.jwk] })))
    const altered = valid.token.split('.')
    altered[1] = encode({ aud: env.ACCESS_AUD, iss: env.ACCESS_TEAM_DOMAIN, email: 'staff@example.com', exp: Math.floor(Date.now()/1000) + 500 })
    const tokens = [
      altered.join('.'),
      (await createSignedToken({ exp: Math.floor(Date.now()/1000) - 10 })).token,
      (await createSignedToken({ aud: 'other-app' })).token,
      (await createSignedToken({ iss: 'https://wrong.cloudflareaccess.com' })).token,
      'a.b.c',
    ]
    for (const token of tokens) {
      const result = await verifyStaffAccess(new Request('https://example.test', { headers: { 'Cf-Access-Jwt-Assertion': token } }), env)
      expect(result).toBe(false)
    }
  })
})
