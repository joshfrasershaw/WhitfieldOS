import { describe, expect, it, vi } from 'vitest'
import worker from './index'
import type { WorkerEnv } from './index'

function environment(): WorkerEnv {
  return {
    ASSETS: { fetch: vi.fn(async () => new Response('Application assets')) },
    SERVICEM8_API_KEY: 'test-only-not-a-real-secret',
  }
}

describe('Worker runtime boundary', () => {
  it('reports health without exposing secrets or provider connection status', async () => {
    const env = environment()
    const response = await worker.fetch(
      new Request('https://example.test/api/health'),
      env,
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({
      status: 'ok',
      service: 'WhitfieldOS API',
    })
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it('supports HEAD and rejects writes to the health endpoint', async () => {
    const head = await worker.fetch(
      new Request('https://example.test/api/health', { method: 'HEAD' }),
      environment(),
    )
    expect(head.status).toBe(200)
    expect(await head.text()).toBe('')
    const post = await worker.fetch(
      new Request('https://example.test/api/health', { method: 'POST' }),
      environment(),
    )
    expect(post.status).toBe(405)
    expect(post.headers.get('Allow')).toBe('GET, HEAD')
  })

  it('keeps unimplemented customer and provider routes closed instead of falling back to HTML', async () => {
    const env = environment()
    for (const path of [
      '/api',
      '/api/customers',
      '/api/servicem8',
      '/api/unknown',
    ]) {
      const response = await worker.fetch(
        new Request('https://example.test' + path),
        env,
      )
      expect(response.status).toBe(404)
      expect(await response.json()).toEqual({
        error: 'API endpoint not available',
      })
    }
    expect(env.ASSETS.fetch).not.toHaveBeenCalled()
  })

  it('preserves application asset routing for departmental and other non-API paths', async () => {
    const env = environment()
    for (const path of [
      '/',
      '/dispatch',
      '/triage',
      '/assets/example.js',
      '/apiary',
    ]) {
      const request = new Request('https://example.test' + path)
      expect(await (await worker.fetch(request, env)).text()).toBe(
        'Application assets',
      )
      expect(env.ASSETS.fetch).toHaveBeenLastCalledWith(request)
    }
  })
})
