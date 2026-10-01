import assert from 'node:assert/strict'
import test from 'node:test'
import { GoTrueClient } from '@supabase/auth-js'
import { createAuthStorage } from './authPersistence.ts'

function memoryStorage() {
  const values = new Map<string, string>()
  return { values, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) } }
}
const user = { id: '00000000-0000-4000-8000-000000000018', aud: 'authenticated', role: 'authenticated', email: 'synthetic@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
function session() { return { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user } }

test('full locked SDK keeps default temporary sign-in readable and refreshable', async () => {
  const persistent = memoryStorage()
  let requests = 0
  const client = new GoTrueClient({ url: 'https://auth.example.invalid', storageKey: 'test-auth', storage: createAuthStorage(persistent), persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
    fetch: async () => { requests++; return new Response(JSON.stringify(session()), { status: 200, headers: { 'Content-Type': 'application/json' } }) } })
  await client.initialize()
  const login = await client.signInWithPassword({ email: user.email, password: 'synthetic-password' })
  assert.equal(login.error, null)
  assert.equal((await client.getSession()).data.session?.user.id, user.id)
  assert.equal(persistent.getItem('test-auth'), null)
  assert.equal((await client.refreshSession()).error, null)
  assert.equal((await client.getSession()).data.session?.user.id, user.id)
  assert.equal(requests, 2)
  client.stopAutoRefresh()
})

for (const status of [503, 401, 204]) {
  test(`full SDK sign-out ${status} preserves failure or clears successful/ignorable sessions`, async () => {
    const persistent = memoryStorage()
    const storage = createAuthStorage(persistent)
    storage.setRememberMe(true)
    let logoutIdentity: string | null = null
    const client = new GoTrueClient({ url: 'https://auth.example.invalid', storageKey: `logout-${status}`, storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
      fetch: async (input, init) => {
        if (String(input).includes('/logout')) {
          logoutIdentity = new Headers(init?.headers).get('Authorization')
          return new Response(status === 204 ? null : JSON.stringify({ message: 'Synthetic logout response' }), { status, headers: { 'Content-Type': 'application/json' } })
        }
        return new Response(JSON.stringify(session()), { headers: { 'Content-Type': 'application/json' } })
      } })
    await client.initialize()
    await client.signInWithPassword({ email: user.email, password: 'synthetic-password' })
    const result = await client.signOut()
    assert.equal(logoutIdentity, 'Bearer synthetic-access')
    assert.equal(Boolean(result.error), status === 503)
    assert.equal(Boolean((await client.getSession()).data.session), status === 503)
    if (!result.error) storage.setRememberMe(false)
    storage.setRememberMe(true)
    assert.equal(Boolean((await client.getSession()).data.session), status === 503)
    client.stopAutoRefresh()
  })
}

test('full SDK sign-up requiring confirmation and password recovery preserve temporary storage', async () => {
  const storage = createAuthStorage(memoryStorage())
  const client = new GoTrueClient({ url: 'https://auth.example.invalid', storageKey: 'signup', storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
    fetch: async input => new Response(JSON.stringify(String(input).includes('/signup') ? { user } : {}), { headers: { 'Content-Type': 'application/json' } }) })
  await client.initialize()
  const signup = await client.signUp({ email: user.email, password: 'synthetic-password' })
  assert.equal(signup.error, null)
  assert.equal(signup.data.session, null)
  assert.equal((await client.resetPasswordForEmail(user.email)).error, null)
  assert.equal((await client.getSession()).data.session, null)
  client.stopAutoRefresh()
})

test('SDK automatic refresh ticker reads and updates the temporary session', async (context) => {
  const storage = createAuthStorage(memoryStorage())
  let tick: (() => Promise<void>) | undefined
  context.mock.method(globalThis, 'setInterval', (callback: () => Promise<void>) => {
    tick = callback
    return { unref() {} }
  })
  context.mock.method(globalThis, 'clearInterval', () => {})
  let refreshes = 0
  const client = new GoTrueClient({ url: 'https://auth.example.invalid', storageKey: 'automatic-refresh', storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
    fetch: async input => {
      const refresh = String(input).includes('grant_type=refresh_token')
      if (refresh) refreshes++
      return Response.json({ ...session(), access_token: refresh ? 'synthetic-refreshed' : 'synthetic-access' })
    } })
  await client.initialize()
  await client.signInWithPassword({ email: user.email, password: 'synthetic-password' })
  const current = JSON.parse(storage.getItem('automatic-refresh')!)
  storage.setItem('automatic-refresh', JSON.stringify({ ...current, expires_at: Math.floor(Date.now() / 1000) + 60 }))
  await client.startAutoRefresh()
  assert.ok(tick)
  await tick()
  assert.equal(refreshes, 1)
  assert.equal((await client.getSession()).data.session?.access_token, 'synthetic-refreshed')
  await client.stopAutoRefresh()
})

for (const type of ['signup', 'recovery']) {
  test(`full SDK initializes ${type} URL callbacks into readable temporary sessions`, async () => {
    // Browser-location/document interfaces are synthetic; URL parsing, user
    // verification, session storage and auth event delivery are the real SDK.
    const descriptors = new Map(['window', 'document', 'BroadcastChannel'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
    const location = new URL(`https://journal.example.invalid/#access_token=synthetic-url&refresh_token=synthetic-refresh&expires_in=3600&token_type=bearer&type=${type}`)
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } })
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {} })
    Object.defineProperty(globalThis, 'BroadcastChannel', { configurable: true, value: undefined })
    try {
      const persistent = memoryStorage()
      const storage = createAuthStorage(persistent)
      const events: string[] = []
      const client = new GoTrueClient({ url: 'https://auth.example.invalid', storageKey: `callback-${type}`, storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: true,
        fetch: async () => Response.json(user) })
      const { data: { subscription } } = client.onAuthStateChange(event => { events.push(event) })
      assert.equal((await client.initialize()).error, null)
      await new Promise(resolve => setTimeout(resolve, 10))
      assert.equal((await client.getSession()).data.session?.user.id, user.id)
      assert.equal((await client.getSession()).data.session?.access_token, 'synthetic-url')
      assert.ok(events.includes(type === 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN'))
      assert.equal(location.hash, '')
      assert.equal(persistent.getItem(`callback-${type}`), null)
      assert.equal(createAuthStorage(persistent).getItem(`callback-${type}`), null)
      subscription.unsubscribe()
      await client.stopAutoRefresh()
    } finally {
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor)
        else Reflect.deleteProperty(globalThis, key)
      }
    }
  })
}
