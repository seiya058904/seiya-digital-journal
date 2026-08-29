/// <reference types="@cloudflare/vitest-pool-workers/types" />
import { SELF } from 'cloudflare:test'
import { afterEach, describe, expect, it } from 'vitest'

const TARGET_QUERY = 'targetType=archive&targetId=archive-stepper'
const SUPABASE_ORIGIN = 'https://supabase.test'
const restores: Array<() => void> = []

afterEach(() => {
  while (restores.length) restores.pop()!()
})

function stubUpstream(handler: (request: Request, url: URL) => Response) {
  const original = globalThis.fetch
  const calls: Array<{ method: string, url: URL, body: string }> = []
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin === SUPABASE_ORIGIN) {
      const body = await request.text()
      calls.push({ method: request.method, url, body })
      return handler(request, url)
    }
    return original(input as RequestInfo, init)
  }) as typeof fetch
  restores.push(() => { globalThis.fetch = original })
  return calls
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('public like counter', () => {
  it('reads the Archive counter without authentication or user identity', async () => {
    const calls = stubUpstream((request, url) => {
      expect(request.method).toBe('GET')
      expect(url.pathname).toBe('/rest/v1/like_counters')
      return jsonResponse([{ count: 128 }])
    })

    const response = await SELF.fetch(`https://example.com/api/likes/count?${TARGET_QUERY}`)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, data: { count: 128 } })
    expect(calls[0].body).toBe('')
  })

  it('atomically increments the Archive counter through the database RPC', async () => {
    const calls = stubUpstream((request, url) => {
      expect(request.method).toBe('POST')
      expect(url.pathname).toBe('/rest/v1/rpc/increment_like_counter')
      return jsonResponse([{ count: 129 }])
    })

    const response = await SELF.fetch('https://example.com/api/likes', {
      method: 'POST',
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper' }),
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, data: { count: 129 } })
    expect(JSON.parse(calls[0].body)).toEqual({ p_target_type: 'archive', p_target_id: 'archive-stepper' })
  })

  it('does not expose a user-state endpoint or require authentication to increment', async () => {
    const response = await SELF.fetch(`https://example.com/api/likes/me?${TARGET_QUERY}`)
    expect(response.status).toBe(404)
  })
})
