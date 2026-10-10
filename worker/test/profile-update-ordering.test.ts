/// <reference types="@cloudflare/vitest-pool-workers/types" />
import { SELF } from 'cloudflare:test'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * JR-01 regression: a profile PATCH must complete the statistics reads needed
 * by its own success response BEFORE performing the irreversible profile
 * write. A statistics failure must surface as an error response while the
 * profile write count stays strictly zero — the caller must never be told the
 * save failed after it actually succeeded.
 */

const SUPABASE_ORIGIN = 'https://supabase.test'
const ALLOWED_ORIGIN = 'https://seiya058904.github.io'

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
  display_name: 'Old Name',
  avatar_key: 'avatar-01',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const savedProfile = {
  user_id: 'user-1',
  display_name: 'New Name',
  avatar_key: 'avatar-02',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-10-10T00:00:00Z',
}

type ProfileStore = {
  profile: typeof fakeProfile
  profileWrites: number
}

function createStore(): ProfileStore {
  return { profile: { ...fakeProfile }, profileWrites: 0 }
}

type StoreOptions = {
  commentsStatsStatus?: number
  likesStatsStatus?: number
  commentsStatsThrow?: boolean
  likesStatsThrow?: boolean
  profileWriteStatus?: number
}

function storeHandler(store: ProfileStore, options: StoreOptions = {}): UpstreamHandler {
  return (request, url) => {
    if (url.pathname === '/auth/v1/user') return jsonResponse(fakeUser)
    if (url.pathname === '/rest/v1/profiles' && request.method === 'GET') return jsonResponse([store.profile])
    if (url.pathname === '/rest/v1/profiles' && request.method === 'PATCH') {
      store.profileWrites += 1
      if (options.profileWriteStatus) {
        return new Response('upstream write failed', { status: options.profileWriteStatus })
      }
      store.profile = { ...savedProfile }
      return jsonResponse([savedProfile])
    }
    if (url.pathname === '/rest/v1/comments' && request.method === 'HEAD') {
      if (options.commentsStatsThrow) throw new Error('network dropped')
      if (options.commentsStatsStatus) return new Response(null, { status: options.commentsStatsStatus })
      return countResponse(4)
    }
    if (url.pathname === '/rest/v1/likes' && request.method === 'HEAD') {
      if (options.likesStatsThrow) throw new Error('network dropped')
      if (options.likesStatsStatus) return new Response(null, { status: options.likesStatsStatus })
      return countResponse(2)
    }
    return jsonResponse([])
  }
}

function callsToPath(calls: UpstreamCall[], method: string, path: string) {
  return calls.filter((call) => call.method === method && call.path === path)
}

async function patchProfile() {
  return SELF.fetch('https://example.com/api/profile/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer valid-token',
      'Origin': ALLOWED_ORIGIN,
    },
    body: JSON.stringify({ displayName: 'New Name', avatarKey: 'avatar-02' }),
  })
}

async function expectErrorResponse(response: Response, status: number, code: string) {
  expect(response.status).toBe(status)
  const json = await response.json() as { ok: boolean, error?: { code?: string } }
  expect(json.ok).toBe(false)
  expect(json.error?.code).toBe(code)
}

describe('profile update ordering (JR-01)', () => {
  it('reads statistics before writing the profile on a successful save', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store))

    const response = await patchProfile()

    expect(response.status).toBe(200)
    const json = await response.json() as {
      ok: boolean
      data: { profile: Record<string, string>, stats: { comments: number, likes: number } }
    }
    expect(json.ok).toBe(true)
    expect(json.data.profile.displayName).toBe('New Name')
    expect(json.data.profile.avatarKey).toBe('avatar-02')
    expect(json.data.stats).toEqual({ comments: 4, likes: 2 })
    expect(store.profileWrites).toBe(1)

    const commentStats = calls.findIndex((call) => call.method === 'HEAD' && call.path === '/rest/v1/comments')
    const likeStats = calls.findIndex((call) => call.method === 'HEAD' && call.path === '/rest/v1/likes')
    const writeIndex = calls.findIndex((call) => call.method === 'PATCH' && call.path === '/rest/v1/profiles')
    expect(commentStats).toBeGreaterThanOrEqual(0)
    expect(likeStats).toBeGreaterThanOrEqual(0)
    expect(commentStats).toBeLessThan(writeIndex)
    expect(likeStats).toBeLessThan(writeIndex)
  })

  it('does not write the profile when the comment statistics read fails', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store, { commentsStatsStatus: 503 }))

    const response = await patchProfile()

    await expectErrorResponse(response, 500, 'INTERNAL_ERROR')
    expect(store.profileWrites).toBe(0)
    expect(store.profile.display_name).toBe('Old Name')
    expect(callsToPath(calls, 'PATCH', '/rest/v1/profiles')).toHaveLength(0)
  })

  it('does not write the profile when the like statistics read fails', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store, { likesStatsStatus: 503 }))

    const response = await patchProfile()

    await expectErrorResponse(response, 500, 'INTERNAL_ERROR')
    expect(store.profileWrites).toBe(0)
    expect(store.profile.display_name).toBe('Old Name')
    expect(callsToPath(calls, 'PATCH', '/rest/v1/profiles')).toHaveLength(0)
  })

  it('does not write the profile when a statistics read fails at the network level', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store, { commentsStatsThrow: true }))

    const response = await patchProfile()

    await expectErrorResponse(response, 500, 'INTERNAL_ERROR')
    expect(store.profileWrites).toBe(0)
    expect(store.profile.display_name).toBe('Old Name')
    expect(callsToPath(calls, 'PATCH', '/rest/v1/profiles')).toHaveLength(0)
  })

  it('keeps the existing failure semantics when the profile write itself fails', async () => {
    const store = createStore()
    stubUpstream(storeHandler(store, { profileWriteStatus: 500 }))

    const response = await patchProfile()

    // The write was attempted and its commit outcome is uncertain; the caller
    // must still see the existing failure shape, never a faked success.
    await expectErrorResponse(response, 500, 'INTERNAL_ERROR')
    expect(store.profileWrites).toBe(1)
  })

  it('rejects unauthenticated updates without any upstream call', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store))

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Origin': ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ displayName: 'New Name', avatarKey: 'avatar-02' }),
    })

    await expectErrorResponse(response, 401, 'UNAUTHORIZED')
    expect(calls).toHaveLength(0)
    expect(store.profileWrites).toBe(0)
  })

  it('rejects an invalid payload without writing the profile', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store))

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
        'Origin': ALLOWED_ORIGIN,
      },
      body: JSON.stringify({ displayName: '', avatarKey: 'avatar-02' }),
    })

    await expectErrorResponse(response, 400, 'BAD_REQUEST')
    expect(store.profileWrites).toBe(0)
    expect(callsToPath(calls, 'PATCH', '/rest/v1/profiles')).toHaveLength(0)
  })

  it('supports repeated saves with a statistics read before each write', async () => {
    const store = createStore()
    const calls = stubUpstream(storeHandler(store))

    const first = await patchProfile()
    const second = await patchProfile()

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(store.profileWrites).toBe(2)

    const writes = calls
      .map((call, index) => ({ call, index }))
      .filter(({ call }) => call.method === 'PATCH' && call.path === '/rest/v1/profiles')
    expect(writes).toHaveLength(2)
    for (const { index } of writes) {
      const priorCommentStats = calls.slice(0, index).some((call) => call.method === 'HEAD' && call.path === '/rest/v1/comments')
      const priorLikeStats = calls.slice(0, index).some((call) => call.method === 'HEAD' && call.path === '/rest/v1/likes')
      expect(priorCommentStats).toBe(true)
      expect(priorLikeStats).toBe(true)
    }
  })

  it('returns the saved profile and real statistics on a follow-up read', async () => {
    const store = createStore()
    stubUpstream(storeHandler(store))

    await patchProfile()

    const response = await SELF.fetch('https://example.com/api/profile/me', {
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(response.status).toBe(200)
    const json = await response.json() as {
      ok: boolean
      data: { profile: Record<string, string>, stats: { comments: number, likes: number } }
    }
    expect(json.ok).toBe(true)
    expect(json.data.profile.displayName).toBe('New Name')
    expect(json.data.profile.avatarKey).toBe('avatar-02')
    expect(json.data.stats).toEqual({ comments: 4, likes: 2 })
  })
})
