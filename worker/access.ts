/** Verify Cloudflare Access identity before ANY ServiceM8 request.
 * Static-assets Workers cannot rely on ctx.access (Cloudflare's asset router
 * does not forward it). Validate the signed Access JWT against the team's JWKS.
 * No bypass via user-supplied headers, keys or development flags.
 */
export interface AccessEnv {
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 12_000)
    throw new Error('Invalid base64url')
  const binary = atob(
    value.replace(/-/g, '+').replace(/_/g, '/') +
      '='.repeat((4 - (value.length % 4)) % 4),
  )
  const result = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) result[i] = binary.charCodeAt(i)
  return result
}

function decodedJson(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(
    new TextDecoder().decode(decodeBase64Url(value)),
  )
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('Invalid JSON object')
  return parsed as Record<string, unknown>
}

export function accessConfigured(env: AccessEnv): boolean {
  const domain = env.ACCESS_TEAM_DOMAIN?.trim() ?? ''
  return (
    /^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com\/?$/.test(domain) &&
    typeof env.ACCESS_AUD === 'string' &&
    /^[a-zA-Z0-9_-]{12,128}$/.test(env.ACCESS_AUD)
  )
}

export async function verifyStaffAccess(
  request: Request,
  env: AccessEnv,
): Promise<boolean> {
  if (!accessConfigured(env)) return false
  const token = request.headers.get('cf-access-jwt-assertion')
  if (!token || token.length > 12_000) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const header = decodedJson(parts[0])
    const claims = decodedJson(parts[1])
    const kid = header.kid
    if (
      header.alg !== 'RS256' ||
      typeof kid !== 'string' ||
      kid.length < 3 ||
      kid.length > 200
    )
      return false

    const domain = env.ACCESS_TEAM_DOMAIN!.trim().replace(/\/$/, '')
    const timestamp = Math.floor(Date.now() / 1000)
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    if (
      claims.iss !== domain ||
      !audiences.includes(env.ACCESS_AUD) ||
      typeof claims.exp !== 'number' ||
      claims.exp <= timestamp ||
      (typeof claims.nbf === 'number' && claims.nbf > timestamp + 60) ||
      (typeof claims.iat === 'number' && claims.iat > timestamp + 60) ||
      typeof claims.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(claims.email)
    )
      return false

    // Domain is validated against the fixed Cloudflare Access origin pattern.
    const keysResponse = await fetch(domain + '/cdn-cgi/access/certs', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    })
    if (!keysResponse.ok) return false
    const keysData: unknown = await keysResponse.json()
    if (
      !keysData ||
      typeof keysData !== 'object' ||
      !('keys' in keysData) ||
      !Array.isArray(keysData.keys)
    )
      return false
    const key = keysData.keys.find((candidate: unknown) => {
      if (!candidate || typeof candidate !== 'object') return false
      const item = candidate as Record<string, unknown>
      return (
        item.kid === kid &&
        item.kty === 'RSA' &&
        (item.alg === undefined || item.alg === 'RS256') &&
        (item.use === undefined || item.use === 'sig')
      )
    }) as JsonWebKey | undefined
    if (!key) return false
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(parts[0] + '.' + parts[1]),
    )
  } catch {
    // Fail closed; never expose JWT, identity, JWK errors or secret values.
    return false
  }
}
