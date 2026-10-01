import assert from 'node:assert/strict'
import test from 'node:test'
import { GoTrueClient } from '@supabase/auth-js'
import { createAuthStorage } from './authPersistence.ts'

// Two tabs share one origin's persistent storage; each tab owns its adapter.
function createSharedStorage() {
  const values = new Map<string, string>()
  return { values, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) } }
}
const user = { id: '00000000-0000-4000-8000-0000000000b0', aud: 'authenticated', role: 'authenticated', email: 'synthetic-b@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
function session() { return { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user } }

function createClient(storage: ReturnType<typeof createAuthStorage>, storageKey: string, requests: string[] = []) {
  return new GoTrueClient({ url: 'https://auth.example.invalid', storageKey, storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
    fetch: async (input) => {
      requests.push(String(input))
      return new Response(JSON.stringify(session()), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } })
}

// The real SDK only enables its cross-context BroadcastChannel under
// isBrowser(); stub the two globals so both clients exchange real events.
Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: new URL('https://journal.example.invalid/'), addEventListener() {} } })
Object.defineProperty(globalThis, 'document', { configurable: true, value: {} })


function stopClient(client: GoTrueClient) {
  client.stopAutoRefresh()
  // The SDK's BroadcastChannel keeps the Node event loop alive; release it.
  const channel = (client as unknown as { broadcastChannel?: { unref(): void } }).broadcastChannel
  channel?.unref()
}

async function waitForEvent(client: GoTrueClient, event: string) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { subscription.unsubscribe(); reject(new Error(`timeout waiting for ${event}`)) }, 5000)
    const { data: { subscription } } = client.onAuthStateChange((next) => {
      if (next !== event) return
      clearTimeout(timer)
      subscription.unsubscribe()
      resolve()
    })
  })
}

test('plain temporary reads never delete another tab\'s remembered session', async () => {
  const persistent = createSharedStorage()
  const adapterA = createAuthStorage(persistent)
  const adapterB = createAuthStorage(persistent)
  const storageKey = 'cross-tab-plain-reads'
  const clientA = createClient(adapterA, storageKey)
  const clientB = createClient(adapterB, storageKey)
  await clientA.initialize()
  await clientB.initialize()

  // Tab B signs in with Remember me and publishes a persistent session.
  const signedInOnA = waitForEvent(clientA, 'SIGNED_IN')
  adapterB.setRememberMe(true)
  const login = await clientB.signInWithPassword({ email: user.email, password: 'synthetic-password' })
  assert.equal(login.error, null)
  assert.notEqual(persistent.getItem(storageKey), null)
  // Tab A receives the real SDK broadcast, as in a browser.
  await signedInOnA

  // Tab A's plain read (getSession/API bootstrap) must be non-destructive.
  assert.equal((await clientA.getSession()).data.session, null)
  assert.notEqual(persistent.getItem(storageKey), null)
  assert.equal((await clientB.getSession()).data.session?.user.id, user.id)

  // A fresh page still restores B's remembered session.
  const restoredClient = createClient(createAuthStorage(persistent), storageKey)
  await restoredClient.initialize()
  assert.equal((await restoredClient.getSession()).data.session?.user.id, user.id)

  // Tab A stays in its temporary lifecycle instead of adopting the session.
  await clientA.refreshSession()
  assert.notEqual(persistent.getItem(storageKey), null)
  assert.equal((await clientB.getSession()).data.session?.user.id, user.id)

  stopClient(clientA); stopClient(clientB); stopClient(restoredClient)
})

test('a temporary session survives a later remembered login on another tab', async () => {
  const persistent = createSharedStorage()
  const adapterA = createAuthStorage(persistent)
  const adapterB = createAuthStorage(persistent)
  const storageKey = 'cross-tab-temporary-session'
  const clientA = createClient(adapterA, storageKey)
  const clientB = createClient(adapterB, storageKey)
  await clientA.initialize()
  await clientB.initialize()

  // Tab A signs in without Remember me; the session is page-local.
  const loginA = await clientA.signInWithPassword({ email: user.email, password: 'synthetic-password' })
  assert.equal(loginA.error, null)
  assert.equal((await clientA.getSession()).data.session?.user.id, user.id)
  assert.equal(persistent.getItem(storageKey), null)

  // Tab B remembered login publishes a persistent session; A keeps its own.
  adapterB.setRememberMe(true)
  const loginB = await clientB.signInWithPassword({ email: user.email, password: 'synthetic-password' })
  assert.equal(loginB.error, null)
  assert.notEqual(persistent.getItem(storageKey), null)
  assert.equal((await clientA.getSession()).data.session?.user.id, user.id)

  // A's own refresh writes only to its page-local session.
  await clientA.refreshSession()
  assert.equal((await clientA.getSession()).data.session?.user.id, user.id)
  assert.notEqual(persistent.getItem(storageKey), null)
  assert.equal((await clientB.getSession()).data.session?.user.id, user.id)

  stopClient(clientA); stopClient(clientB)
})

test('temporary tab operations never clear the shared persistent session', async () => {
  const persistent = createSharedStorage()
  const adapterA = createAuthStorage(persistent)
  const adapterB = createAuthStorage(persistent)
  const storageKey = 'cross-tab-owned-cleanup'
  await clientLifecycle(persistent, adapterA, adapterB, storageKey)
})

async function clientLifecycle(persistent: ReturnType<typeof createSharedStorage>, adapterA: ReturnType<typeof createAuthStorage>, adapterB: ReturnType<typeof createAuthStorage>, storageKey: string) {
  adapterB.setRememberMe(true)
  adapterB.setItem(storageKey, 'remembered-session')
  adapterB.setItem(`${storageKey}-code-verifier`, 'remembered-verifier')

  // Every temporary read/write/remove is non-destructive.
  assert.equal(adapterA.getItem(storageKey), null)
  adapterA.setItem(`${storageKey}-verifier`, 'temporary-verifier')
  adapterA.removeItem(`${storageKey}-verifier`)
  assert.equal(persistent.getItem(storageKey), 'remembered-session')
  assert.equal(persistent.getItem(`${storageKey}-code-verifier`), 'remembered-verifier')

  // Enabling Remember me on the temporary tab replaces the stale value with
  // this page's account instead of resurrecting the other tab's session.
  adapterA.setItem(storageKey, 'temporary-account')
  adapterA.setRememberMe(true)
  assert.equal(persistent.getItem(storageKey), 'temporary-account')
  adapterA.setRememberMe(false)
  assert.equal(persistent.getItem(storageKey), null)

  // A remembered tab's sign-out still clears its own persisted session.
  adapterB.setItem(storageKey, 'remembered-session')
  adapterB.removeItem(storageKey)
  assert.equal(persistent.getItem(storageKey), null)
}

test('mode transitions remain the only persistent cleanup owners', async () => {
  const persistent = createSharedStorage()
  const temporary = createAuthStorage(persistent)
  temporary.setItem('auth-token', 'session')
  assert.equal(persistent.getItem('auth-token'), null)
  // No storage writes happen while the tab stays temporary.
  assert.equal(persistent.values.size, 0)
})
