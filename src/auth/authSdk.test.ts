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
