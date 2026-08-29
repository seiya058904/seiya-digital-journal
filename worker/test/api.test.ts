/// <reference types="@cloudflare/vitest-pool-workers/types" />
import { SELF } from 'cloudflare:test'
import { afterEach, describe, expect, it } from 'vitest'

const SUPABASE_ORIGIN = 'https://supabase.test'
const ALLOWED_ORIGIN = 'https://seiya058904.github.io'
const TARGET_QUERY = 'targetType=archive&targetId=archive-stepper'

type UpstreamCall = {
  method: string
  url: URL
  path: string
  bodyText: string
}

type UpstreamHandler = (request: Request, url: URL, callIndex: number) => Response

const restoreFns: Array<() => void> = []

afterEach(() => {
  while (restoreFns.length > 0) {
    restoreFns.pop()!()
  }
})

/**
 * Intercepts upstream fetches to the fake Supabase origin so the Worker is
 * tested inside the real Workers runtime without touching production.
 * Request bodies are captured eagerly because workerd streams cannot be read
 * after the dispatch context has ended.
 */
function stubUpstream(handler: UpstreamHandler) {
  const original = globalThis.fetch
  const calls: UpstreamCall[] = []

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin === SUPABASE_ORIGIN) {
      const bodyText = await request.text()
      calls.push({ method: request.method, url, path: url.pathname, bodyText })
      return handler(request, url, calls.length - 1)
    }
    return original(input as RequestInfo, init)
  }) as typeof fetch

  restoreFns.push(() => {
    globalThis.fetch = original
  })

  return calls
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

function emptyResponse(status = 200) {
  return new Response(null, { status })
}

function countResponse(count: number) {
  return new Response(null, {
    status: 200,
    headers: { 'Content-Range': `0-${Math.max(count - 1, 0)}/${count}` },
  })
}

const fakeUser = {
  id: 'user-1',
  email: 'visitor@example.com',
  created_at: '2026-01-01T00:00:00Z',
  user_metadata: {},
}

const fakeProfile = {
  user_id: 'user-1',
  display_name: 'Seiya',
  avatar_key: 'avatar-01',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const fakeCommentRow = {
  id: 'comment-1',
  author_name: 'Seiya',
  body: 'Hello archive',
  created_at: '2026-08-29T00:00:00Z',
}

/** Auth succeeds, profile already exists, no prior comment (rate-limit check passes). */
function happyPathHandler(): UpstreamHandler {
  return (request, url) => {
    if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
    if (url.pathname === '/rest/v1/profiles' && request.method === 'GET') return jsonResponse([fakeProfile])
    return jsonResponse([])
  }
}

function callsToPath(calls: UpstreamCall[], method: string, path: string) {
  return calls.filter((call) => call.method === method && call.path === path)
}

async function expectApiError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status)
  const json = await response.json() as { ok: boolean, error?: { code?: string } }
  expect(json.ok).toBe(false)
  expect(json.error?.code).toBe(code)
}

describe('public endpoints', () => {
  it('responds to health check', async () => {
    const response = await SELF.fetch('https://example.com/api/health')
    expect(response.status).toBe(200)
    const json = await response.json() as { ok: boolean, data: { ok: boolean } }
    expect(json).toEqual({ ok: true, data: { ok: true } })
  })

  it('answers OPTIONS preflight with 204 and CORS headers', async () => {
    const response = await SELF.fetch('https://example.com/api/likes/count', {
      method: 'OPTIONS',
      headers: { Origin: ALLOWED_ORIGIN },
    })
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN)
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('PATCH')
    expect(response.headers.get('Vary')).toBe('Origin')
  })

  it('echoes an allowed origin on a normal request', async () => {
    stubUpstream(() => jsonResponse([{ count: 0 }]))
    const response = await SELF.fetch(`https://example.com/api/likes/count?${TARGET_QUERY}`, {
      headers: { Origin: ALLOWED_ORIGIN },
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED_ORIGIN)
  })

  it('rejects a disallowed origin with 403', async () => {
    const response = await SELF.fetch('https://example.com/api/health', {
      headers: { Origin: 'https://evil.example' },
    })
    await expectApiError(response, 403, 'FORBIDDEN')
  })

  it('returns 404 for unknown routes', async () => {
    const response = await SELF.fetch('https://example.com/api/nope')
    await expectApiError(response, 404, 'NOT_FOUND')
  })
})

describe('comment listing', () => {
  it('lists comments with mapped field names', async () => {
    const calls = stubUpstream(() => jsonResponse([fakeCommentRow]))

    const response = await SELF.fetch(`https://example.com/api/comments?${TARGET_QUERY}`)
    expect(response.status).toBe(200)
    const json = await response.json() as { ok: boolean, data: Array<Record<string, string>> }
    expect(json.ok).toBe(true)
    expect(json.data).toEqual([
      { id: 'comment-1', authorName: 'Seiya', body: 'Hello archive', createdAt: '2026-08-29T00:00:00Z' },
    ])

    expect(calls).toHaveLength(1)
    expect(calls[0].url.searchParams.get('target_type')).toBe('eq.archive')
    expect(calls[0].url.searchParams.get('target_id')).toBe('eq.archive-stepper')
    expect(calls[0].url.searchParams.get('order')).toBe('created_at.desc')
  })

  it('clamps the listing limit to the server maximum', async () => {
    const calls = stubUpstream(() => jsonResponse([]))

    const response = await SELF.fetch(`https://example.com/api/comments?${TARGET_QUERY}&limit=999`)
    expect(response.status).toBe(200)
    expect(calls[0].url.searchParams.get('limit')).toBe('50')
  })

  it('rejects an invalid comment target', async () => {
    const response = await SELF.fetch('https://example.com/api/comments?targetType=blog&targetId=somewhere')
    await expectApiError(response, 400, 'BAD_REQUEST')
  })

  it('maps upstream failure to a generic 500', async () => {
    stubUpstream(() => new Response('postgrest exploded', { status: 500 }))
    const response = await SELF.fetch(`https://example.com/api/comments?${TARGET_QUERY}`)
    expect(response.status).toBe(500)
    const json = await response.json() as { ok: boolean, error: { code: string, message: string } }
    expect(json.ok).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('The backend request failed.')
  })
})

describe('comment creation', () => {
  it('creates a comment for an authenticated user', async () => {
    const calls = stubUpstream((request, url, callIndex) => {
      if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
      if (url.pathname === '/rest/v1/profiles' && request.method === 'GET') {
        return jsonResponse(callIndex === 0 ? [] : [fakeProfile])
      }
      if (url.pathname === '/rest/v1/profiles' && request.method === 'POST') {
        return emptyResponse(201)
      }
      if (url.pathname === '/rest/v1/comments' && request.method === 'GET') return jsonResponse([])
      if (url.pathname === '/rest/v1/comments' && request.method === 'POST') return jsonResponse([fakeCommentRow], 201)
      return jsonResponse([])
    })

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
        'Origin': ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: 'Hello archive' }),
    })

    expect(response.status).toBe(201)
    const json = await response.json() as { ok: boolean, data: Record<string, string> }
    expect(json.ok).toBe(true)
    expect(json.data).toEqual({
      id: 'comment-1',
      authorName: 'Seiya',
      body: 'Hello archive',
      createdAt: '2026-08-29T00:00:00Z',
    })

    const inserts = callsToPath(calls, 'POST', '/rest/v1/comments')
    expect(inserts).toHaveLength(1)
    const insertBody = JSON.parse(inserts[0].bodyText) as Record<string, string>
    expect(insertBody).toMatchObject({
      user_id: 'user-1',
      author_name: 'Seiya',
      target_type: 'archive',
      target_id: 'archive-stepper',
      body: 'Hello archive',
      status: 'published',
    })
  })

  it('rejects comment creation without authorization', async () => {
    const calls = stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: 'Hi' }),
    })

    await expectApiError(response, 401, 'UNAUTHORIZED')
    expect(calls).toHaveLength(0)
  })

  it('rejects an invalid upstream token', async () => {
    stubUpstream(() => new Response(null, { status: 401 }))

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer expired-token',
      },
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: 'Hi' }),
    })

    await expectApiError(response, 401, 'UNAUTHORIZED')
  })

  it('rejects malformed JSON bodies', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: '{"targetType":',
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })

  it('rejects an invalid target on creation', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({ targetType: 'archive', targetId: 'wrong-target', body: 'Hi' }),
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })

  it('rejects an empty comment body', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: '   ' }),
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })

  it('rejects an oversized comment body', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: 'a'.repeat(501) }),
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })
})

describe('comment deletion', () => {
  it('deletes the caller\'s own comment', async () => {
    const calls = stubUpstream((request, url) => {
      if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
      if (url.pathname === '/rest/v1/comments' && request.method === 'DELETE') {
        return jsonResponse([{ id: 'comment-1' }])
      }
      return jsonResponse([])
    })

    const response = await SELF.fetch('https://example.com/api/comments/comment-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(response.status).toBe(200)
    const deleteCall = callsToPath(calls, 'DELETE', '/rest/v1/comments')[0]
    expect(deleteCall.url.searchParams.get('id')).toBe('eq.comment-1')
    expect(deleteCall.url.searchParams.get('user_id')).toBe('eq.user-1')
  })

  it('returns 404 when deleting another user\'s comment', async () => {
    stubUpstream((request, url) => {
      if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
      if (url.pathname === '/rest/v1/comments' && request.method === 'DELETE') return jsonResponse([])
      return jsonResponse([])
    })

    const response = await SELF.fetch('https://example.com/api/comments/comment-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-token' },
    })

    await expectApiError(response, 404, 'NOT_FOUND')
  })
})

describe('likes', () => {
  it('is covered by like-counter.test.ts', () => {
    expect(true).toBe(true)
  })
})

describe('profile', () => {
  it('returns profile and stats for the current user', async () => {
    stubUpstream((request, url) => {
      if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
      if (url.pathname === '/rest/v1/profiles') return jsonResponse([fakeProfile])
      if (url.pathname === '/rest/v1/comments' && request.method === 'HEAD') return countResponse(4)
      if (url.pathname === '/rest/v1/likes' && request.method === 'HEAD') return countResponse(2)
      return jsonResponse([])
    })

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(response.status).toBe(200)
    const json = await response.json() as {
      ok: boolean
      data: {
        profile: Record<string, string>
        stats: { comments: number, likes: number }
      }
    }
    expect(json.ok).toBe(true)
    expect(json.data.profile).toEqual({
      displayName: 'Seiya',
      avatarKey: 'avatar-01',
      email: 'visitor@example.com',
      memberSince: '2026-01-01T00:00:00Z',
    })
    expect(json.data.stats).toEqual({ comments: 4, likes: 2 })
  })

  it('rejects an invalid display name on update', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({ displayName: '', avatarKey: 'avatar-01' }),
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })

  it('rejects an invalid avatar key on update', async () => {
    stubUpstream(happyPathHandler())

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({ displayName: 'Seiya', avatarKey: 'avatar-99' }),
    })

    await expectApiError(response, 400, 'BAD_REQUEST')
  })
})
