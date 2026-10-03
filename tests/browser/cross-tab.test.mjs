import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'
const user = { id: '00000000-0000-4000-8000-0000000000b0', aud: 'authenticated', role: 'authenticated', email: 'synthetic-b@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const userA = { ...user, id: '00000000-0000-4000-8000-0000000000a0', email: 'synthetic-a@example.invalid' }
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }

// Two same-origin pages in one browser context share localStorage, like two
// tabs. Regression: a temporary page's authenticated API call passes through
// client.auth.getSession(), whose storage read used to delete the remembered
// session another page had just published.
test('remembered login survives another temporary page authenticated reads', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  context.setDefaultTimeout(20000)
  const errors = []
  const requests = []
  let posts = 0
  const route = async route => {
    const request = route.request(), url = request.url()
    if (url.startsWith(new URL(base).origin)) return route.continue()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' })
    if (url.startsWith('https://synthetic.supabase.co/')) {
      if (url.includes('/logout')) return route.fulfill({ status: 204, headers: cors })
      const body = request.postDataJSON() || {}
      const identity = body.email === userA.email || body.refresh_token === 'synthetic-refresh-a' ? userA : user
      const suffix = identity === userA ? 'a' : 'b'
      return route.fulfill({ headers: cors, json: { access_token: `synthetic-access-${suffix}`, refresh_token: `synthetic-refresh-${suffix}`, token_type: 'bearer', expires_in: 3600, user: identity } })
    }
    if (url.startsWith('https://api.example.invalid/')) {
      const token = request.headers().authorization
      requests.push({ url, token, method: request.method(), page: request.frame().page() })
      const identity = token === 'Bearer synthetic-access-a' ? userA : user
      if (url.includes('/api/comments') && request.method() === 'POST') {
        posts++
        return route.fulfill({ headers: cors, json: { ok: true, data: { id: 'synthetic-comment' } } })
      }
      return route.fulfill({ headers: cors, json: { ok: true, data: url.includes('/profile/') ? { profile: { displayName: identity.email, avatarKey: 'avatar-01', email: identity.email, memberSince: identity.created_at }, stats: { comments: 0, likes: 0 } } : url.includes('likes') ? { count: 0 } : [] } })
    }
    return route.abort()
  }
  const newPage = async () => {
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(() => {
      window.authBroadcasts = []
      const NativeChannel = window.BroadcastChannel
      window.BroadcastChannel = class extends NativeChannel {
        constructor(name) { super(name); this.addEventListener('message', event => window.authBroadcasts.push(event.data)) }
      }
    })
    await page.route('**/*', route)
    return page
  }
  const signIn = async (page, remember, identity) => {
    await page.goto(base + '#/auth')
    if (remember) await page.getByLabel('Keep me signed in').check()
    await page.getByLabel('Email', { exact: true }).fill(identity.email)
    await page.getByLabel('Password', { exact: true }).fill('synthetic-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(base + '#/')
    await page.locator('.account-menu__chip').first().waitFor()
  }

  try {
    const pageA = await newPage()
    const pageB = await newPage()

    // Tab A signs in without Remember me: page-local temporary session.
    await signIn(pageA, false, userA)
    // Tab B signs in with Remember me: publishes the shared persistent session.
    await signIn(pageB, true, user)
    await pageA.waitForFunction(id => window.authBroadcasts.some(event => event.session?.user.id === id), user.id)
    await pageA.goto(base + '#/profile')
    await pageA.locator('.account-menu__chip-name').filter({ hasText: userA.email }).waitFor()
    const sdkIdentity = await pageA.evaluate(async () => {
      const { getSupabaseClient } = await import('/seiya-digital-journal/src/lib/supabase.ts')
      const { data } = await getSupabaseClient().auth.getSession()
      return { id: data.session.user.id, email: data.session.user.email, token: data.session.access_token }
    })
    assert.deepEqual(sdkIdentity, { id: userA.id, email: userA.email, token: 'synthetic-access-a' })
    const tokenKey = await pageB.evaluate(() => Object.keys(localStorage).find(key => key.endsWith('-auth-token') && !key.includes('code-verifier')))
    assert.ok(tokenKey, 'remembered sign-in persists a session')
    assert.notEqual(await pageB.evaluate(key => localStorage.getItem(key), tokenKey), null)

    // Tab A performs a real authenticated API call (Archive comment submit);
    // requestAuthedApi reads the session through the adapter on every call.
    await pageA.goto(base + '#/archive')
    const stepper = pageA.getByRole('region', { name: 'Journal stepper' })
    await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
    await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
    await pageA.getByLabel('One thought from today').fill('Synthetic cross-tab thought')
    await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
    await stepper.getByRole('button', { name: 'Complete', exact: true }).click()
    await pageA.getByText('Comment published.', { exact: true }).waitFor()
    assert.equal(posts, 1)
    assert.ok(requests.some(row => row.page === pageA && row.url.includes('/profile/') && row.token === 'Bearer synthetic-access-a'))
    assert.ok(requests.some(row => row.page === pageA && row.url.includes('/comments') && row.method === 'POST' && row.token === 'Bearer synthetic-access-a'))
    assert.equal(requests.some(row => row.page === pageA && row.token === 'Bearer synthetic-access-b'), false)

    // The remembered session published by tab B must survive tab A's reads.
    assert.notEqual(await pageA.evaluate(key => localStorage.getItem(key), tokenKey), null)
    assert.notEqual(await pageB.evaluate(key => localStorage.getItem(key), tokenKey), null)

    // Tab B still works and stays signed in after its own reload.
    await pageB.reload()
    await pageB.locator('.account-menu__chip').first().waitFor()
    await pageB.locator('.account-menu__chip-name').filter({ hasText: user.email }).waitFor()

    // A fresh page restores the remembered login.
    const pageC = await newPage()
    await pageC.goto(base)
    await pageC.locator('.account-menu__chip').first().waitFor()
    await pageC.locator('.account-menu__chip-name').filter({ hasText: user.email }).waitFor()
    await pageC.close()

    // Tab A's temporary session is untouched by the other tab's login.
    assert.equal(await pageA.locator('.account-menu__chip').count() >= 1, true)
    await pageA.locator('.account-menu__chip-name').filter({ hasText: userA.email }).waitFor()
    await pageA.evaluate(async () => {
      const { getSupabaseClient } = await import('/seiya-digital-journal/src/lib/supabase.ts')
      const result = await getSupabaseClient().auth.refreshSession()
      if (result.error || result.data.session.user.email !== 'synthetic-a@example.invalid') throw new Error('wrong refresh identity')
    })
    await pageA.locator('.account-menu__chip').click()
    await pageA.getByRole('button', { name: 'Sign out', exact: true }).click()
    await pageA.locator('.header-auth--desktop .header-auth__button').waitFor()
    await pageB.locator('.account-menu__chip-name').filter({ hasText: user.email }).waitFor()
    assert.equal(JSON.parse(await pageB.evaluate(key => localStorage.getItem(key), tokenKey)).user.id, user.id)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
