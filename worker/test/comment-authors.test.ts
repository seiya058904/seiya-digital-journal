/// <reference types="@cloudflare/vitest-pool-workers/types" />
import { afterEach, expect, it } from 'vitest'
import worker from '../src/index'

const originalFetch = globalThis.fetch
const bindings = {
  SUPABASE_URL: 'https://supabase.test', SUPABASE_PUBLISHABLE_KEY: 'synthetic-public',
  SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service', ALLOWED_ORIGINS: 'https://example.com',
}
// Run the real handler in workerd, in the test's I/O context, so the two
// requests can share a deterministic upstream barrier.
const fetchWorker = (url: string, init?: RequestInit) => worker.fetch(new Request(url, init), bindings)
const userId = '00000000-0000-4000-8000-000000000001'
const query = 'targetType=archive&targetId=archive-stepper'
const profile = () => ({ user_id: userId, display_name: 'Old Name', avatar_key: 'avatar-01', created_at: '2026-01-01', updated_at: '2026-01-01' })
type Row = { id: string, user_id: string, author_name: string, body: string, created_at: string }
const row = (id = 'comment-1', authorId = userId): Row => ({ id, user_id: authorId, author_name: 'Stale Name', body: 'Synthetic thought', created_at: '2026-01-01' })
const reply = (data: unknown, status = 200) => Response.json(data, { status })
const post = () => fetchWorker('https://example.com/api/comments', {
  method: 'POST', headers: { Authorization: 'Bearer synthetic', 'Content-Type': 'application/json' },
  body: JSON.stringify({ targetType: 'archive', targetId: 'archive-stepper', body: 'Synthetic thought' }),
})
function stub(handler: (request: Request, url: URL) => Response | Promise<Response>) {
  const calls: Array<{ method: string, url: URL }> = []
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin !== 'https://supabase.test') return originalFetch(input as RequestInfo, init)
    calls.push({ method: request.method, url })
    return handler(request, url)
  }) as typeof fetch
  return calls
}
afterEach(() => { globalThis.fetch = originalFetch })

it('resolves the canonical author after a rename commits before a pending comment insert', async () => {
  let current = profile()
  const comments: Row[] = []
  let entered!: () => void, release!: () => void
  const inserting = new Promise<void>(resolve => { entered = resolve })
  const proceed = new Promise<void>(resolve => { release = resolve })
  stub(async (request, url) => {
    if (url.pathname === '/auth/v1/user') return reply({ id: userId })
    if (request.method === 'HEAD') return new Response(null, { headers: { 'Content-Range': '*/0' } })
    if (url.pathname === '/rest/v1/profiles') {
      if (request.method === 'PATCH') {
        const updates = await request.json() as { display_name: string }
        current = { ...current, display_name: updates.display_name }
        // Mirrors the existing SQL trigger: only rows already present change.
        comments.forEach(comment => { comment.author_name = current.display_name })
      }
      return reply([current])
    }
    if (request.method === 'POST') {
      const body = await request.json() as { author_name: string }
      entered()
      await proceed
      const saved = { ...row(), author_name: body.author_name }
      comments.push(saved)
      return reply([saved], 201)
    }
    return reply(comments)
  })
  const pending = post()
  await inserting
  const rename = await fetchWorker('https://example.com/api/profile/me', {
    method: 'PATCH', headers: { Authorization: 'Bearer synthetic', 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: 'New Name', avatarKey: 'avatar-01' }),
  })
  release()
  expect(rename.status).toBe(200)
  const created = await pending
  expect(created.status).toBe(201)
  expect(await created.json()).toMatchObject({ ok: true, data: { authorName: 'New Name' } })
  expect(comments[0].author_name).toBe('Old Name') // legacy storage is no longer the display source
  const listing = await fetchWorker(`https://example.com/api/comments?${query}`)
  expect(await listing.json()).toMatchObject({ data: [{ authorName: 'New Name' }] })
})

it('resolves a full page by user id in two queries, preserving order and legacy missing profiles', async () => {
  const ids = Array.from({ length: 25 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`)
  const rows = Array.from({ length: 50 }, (_, i) => row(`comment-${i}`, ids[i % ids.length]))
  const profiles = ids.slice(0, -1).map((id, i) => ({ user_id: id, display_name: i < 2 ? 'Same Name' : `Current ${i}` }))
  // A rename of only one of two equal names must never rename the other id.
  profiles[1].display_name = 'Renamed Second'
  const calls = stub((_request, url) => reply(url.pathname.endsWith('/profiles') ? profiles : rows))
  const response = await fetchWorker(`https://example.com/api/comments?${query}&limit=50`)
  const result = await response.json() as { data: Array<Record<string, string>> }
  expect(response.status).toBe(200)
  expect(calls).toHaveLength(2)
  expect(calls[0].url.searchParams.get('limit')).toBe('50')
  expect(calls[1].url.searchParams.get('user_id')).toBe(`in.(${ids.join(',')})`)
  expect(calls[1].url.href).toContain('%2C')
  expect(calls[1].url.searchParams.get('select')).toBe('user_id,display_name')
  expect(result.data.map(comment => comment.id)).toEqual(rows.map(comment => comment.id))
  expect(result.data[0].authorName).toBe('Same Name')
  expect(result.data[1].authorName).toBe('Renamed Second')
  expect(result.data[24].authorName).toBe('Stale Name')
  expect(result.data.every(comment => !('user_id' in comment))).toBe(true)
})

it('does not query profiles for an empty page', async () => {
  const calls = stub(() => reply([]))
  const response = await fetchWorker(`https://example.com/api/comments?${query}`)
  expect(response.status).toBe(200)
  expect(calls).toHaveLength(1)
})

it('does not report stale snapshots as canonical names when the batch read fails', async () => {
  stub((_request, url) => url.pathname.endsWith('/profiles') ? reply({ message: 'synthetic failure' }, 503) : reply([row()]))
  const response = await fetchWorker(`https://example.com/api/comments?${query}`)
  expect(response.status).toBe(500)
  expect(await response.json()).toMatchObject({ ok: false, error: { code: 'INTERNAL_ERROR' } })
})

it.each(['http', 'network', 'invalid-json'])('keeps an acknowledged insert successful when author refresh fails: %s', async (failure) => {
  let committed = false
  const calls = stub((request, url) => {
    if (url.pathname === '/auth/v1/user') return reply({ id: userId })
    if (url.pathname.endsWith('/profiles')) {
      if (!committed) return reply([profile()])
      if (failure === 'network') throw new Error('synthetic offline')
      if (failure === 'invalid-json') return new Response('{')
      return reply({}, 503)
    }
    if (request.method === 'POST') { committed = true; return reply([row()], 201) }
    return reply([])
  })
  const response = await post()
  expect(response.status).toBe(201)
  const result = await response.json() as { data: Record<string, string> }
  expect(result.data.authorName).toBe('Unknown author')
  expect(result.data.id).toBe('comment-1')
  expect(result.data).not.toHaveProperty('user_id')
  expect(calls.filter(call => call.method === 'POST')).toHaveLength(1)
  expect(calls.filter(call => call.method === 'PATCH')).toHaveLength(0)
})
