import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'
const user = { id: '00000000-0000-4000-8000-0000000000c0', aud: 'authenticated', role: 'authenticated', email: 'synthetic-c@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS' }

const deferred = () => {
  let resolve
  const promise = new Promise(res => { resolve = res })
  return { promise, resolve }
}
const profilePayload = name => ({ ok: true, data: { profile: { displayName: name, avatarKey: 'avatar-01', email: user.email, memberSince: user.created_at }, stats: { comments: 3, likes: 5 } } })

// ---------------------------------------------------------------------------
// JR-04: like button on the real archive page. Initial GET 10 hangs, the like
// POST 11 succeeds, then the stale GET 10 completes: visible count, aria label
// and live message must all stay 11. A later legitimate smaller value (9) must
// still be accepted (no Math.max masking).
// ---------------------------------------------------------------------------
test('JR-04 late initial like read cannot clobber the accepted like', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    let heldGet
    let postCount = 0
    await page.route('**/*', async route => {
      const request = route.request(), url = request.url()
      if (url.startsWith(new URL(base).origin)) return route.continue()
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' })
      if (url.includes('/api/likes/count')) {
        if (!heldGet) {
          heldGet = deferred()
          await heldGet.promise
          return route.fulfill({ headers: cors, json: { ok: true, data: 10 } })
        }
        return route.fulfill({ headers: cors, json: { ok: true, data: 10 } })
      }
      if (url.includes('/api/likes') && request.method() === 'POST') {
        postCount++
        return route.fulfill({ headers: cors, json: { ok: true, data: { count: postCount === 1 ? 11 : 9 } } })
      }
      return route.fulfill({ headers: cors, json: { ok: true, data: [] } })
    })
    await page.goto(base + '#/archive')
    await page.getByRole('button', { name: 'Add a Like to the Archive', exact: true }).waitFor()
    // like while the initial read is still hanging
    await page.getByRole('button', { name: 'Add a Like to the Archive', exact: true }).click()
    await page.getByRole('button', { name: 'Add a Like to the Archive — 11 likes' }).waitFor()
    assert.match(String(await page.locator('.archive-like__live').textContent()), /11 total likes/)
    assert.equal(await page.locator('.archive-like__count-value--entering').textContent(), '11', 'entering slot shows 11')
    // release the stale pre-like read (10)
    heldGet.resolve()
    await page.waitForTimeout(400)
    assert.equal(await page.getByRole('button', { name: 'Add a Like to the Archive — 11 likes' }).count(), 1, 'aria stays 11')
    assert.equal(await page.locator('.archive-like__count-value--entering').textContent(), '11', 'entering slot stays 11')
    assert.match(String(await page.locator('.archive-like__live').textContent()), /11 total likes/, 'live message stays 11')
    // a legitimate smaller server value must be accepted, never masked
    await page.getByRole('button', { name: 'Add a Like to the Archive — 11 likes' }).click()
    await page.getByRole('button', { name: 'Add a Like to the Archive — 9 likes' }).waitFor()
    assert.equal(await page.locator('.archive-like__count-value--entering').textContent(), '9')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})

// ---------------------------------------------------------------------------
// JR-02: profile page. PATCH hangs, a token-refresh GET starts and holds a
// pre-save snapshot, PATCH succeeds first, stale GET completes last: the page
// must keep showing the saved name, settle loading, and show no error.
// ---------------------------------------------------------------------------
test('JR-02 stale profile GET cannot clobber a successful save on the real page', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 1400 } })
  context.setDefaultTimeout(20000)
  const errors = []
  const page = await context.newPage()
  page.setDefaultTimeout(20000)
  page.on('pageerror', error => errors.push(error.message))

  let heldPatch
  let heldGet
  let patchCount = 0
  const route = async route2 => {
    const request = route2.request(), url = request.url()
    if (url.startsWith(new URL(base).origin)) return route2.continue()
    if (request.method() === 'OPTIONS') return route2.fulfill({ status: 204, headers: cors, body: '' })
    if (url.startsWith('https://synthetic.supabase.co/')) {
      if (url.includes('grant_type=refresh_token')) {
        return route2.fulfill({ headers: cors, json: { access_token: 'synthetic-access-2', refresh_token: 'synthetic-refresh-2', token_type: 'bearer', expires_in: 3600, user } })
      }
      return route2.fulfill({ headers: cors, json: { access_token: 'synthetic-access-1', refresh_token: 'synthetic-refresh-1', token_type: 'bearer', expires_in: 3600, user } })
    }
    if (url.includes('/api/profile/me')) {
      if (request.method() === 'PATCH') {
        patchCount++
        if (patchCount === 1) {
          heldPatch = deferred()
          await heldPatch.promise
          return route2.fulfill({ headers: cors, json: profilePayload('New Name') })
        }
        return route2.fulfill({ headers: cors, json: profilePayload('New Name') })
      }
      if (heldPatch && !heldGet) {
        // token-refresh GET started while the PATCH was pending: hold it
        heldGet = deferred()
        await heldGet.promise
        return route2.fulfill({ headers: cors, json: profilePayload('Old Name') })
      }
      return route2.fulfill({ headers: cors, json: profilePayload('Old Name') })
    }
    if (url.includes('/api/')) return route2.fulfill({ headers: cors, json: { ok: true, data: [] } })
    return route2.fulfill({ headers: cors, json: { ok: true } })
  }
  await page.route('**/*', route)
  try {
    await page.goto(base + '#/auth')
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('synthetic-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(base + '#/')
    await page.goto(base + '#/profile')
    await page.locator('.profile-hero__name').filter({ hasText: 'Old Name' }).waitFor()
    await page.getByRole('button', { name: 'Edit profile' }).click()
    await page.locator('#profile-display-name').waitFor()
    await page.waitForTimeout(800) // let the editor entry animation settle
    await page.locator('#profile-display-name').fill('New Name')
    const saveButton = page.getByRole('button', { name: 'Save changes' })
    await saveButton.scrollIntoViewIfNeeded()
    await saveButton.click()
    // PATCH is now pending. Trigger a token refresh: the new GET must start
    // while the PATCH is still in flight and hold a pre-save snapshot.
    await page.evaluate(async () => {
      const { getSupabaseClient } = await import('/seiya-digital-journal/src/lib/supabase.ts')
      const result = await getSupabaseClient().auth.refreshSession()
      if (result.error) throw new Error('refresh failed')
    })
    for (let i = 0; i < 50 && !heldGet; i++) await page.waitForTimeout(100)
    assert.ok(heldGet, 'token-refresh GET started while the PATCH was pending')
    // PATCH succeeds first
    heldPatch.resolve()
    await page.locator('.profile-hero__name').filter({ hasText: 'New Name' }).waitFor()
    // the stale pre-save GET then completes
    heldGet.resolve()
    await page.waitForTimeout(400)
    assert.equal(await page.locator('.profile-hero__name').textContent(), 'New Name', 'saved name survives the stale GET')
    assert.equal(await page.locator('.profile-empty-state').count(), 0, 'no error state replaces the profile')
    assert.equal(await page.getByRole('button', { name: 'Retry' }).count(), 0, 'no retry button (no read error)')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})

// ---------------------------------------------------------------------------
// JR-03: signup pending → switch to Sign in → late signup confirmation must
// not hijack the new view, its inputs, or its submitting state.
// ---------------------------------------------------------------------------
test('JR-03 late signup callback cannot hijack the sign-in form on the real page', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    let signup
    await page.route('**/*', async route => {
      const request = route.request(), url = request.url()
      if (url.startsWith(new URL(base).origin)) return route.continue()
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' })
      if (url.includes('/signup')) {
        signup = deferred()
        await signup.promise
        return route.fulfill({ headers: cors, json: { ...user, session: null } })
      }
      if (url.startsWith('https://synthetic.supabase.co/')) {
        return route.fulfill({ headers: cors, json: { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user } })
      }
      if (url.includes('/api/')) return route.fulfill({ headers: cors, json: { ok: true, data: [] } })
      return route.fulfill({ headers: cors, json: { ok: true } })
    })
    await page.goto(base + '#/auth')
    await page.getByRole('button', { name: 'Create an account' }).click()
    await page.getByLabel('Display name').fill('Old Display')
    await page.getByLabel('Email', { exact: true }).fill('signup@example.invalid')
    await page.getByLabel('Password', { exact: true }).fill('signup-password-1')
    await page.getByLabel('Confirm password').fill('signup-password-1')
    await page.getByRole('button', { name: 'Create account', exact: true }).click()
    // switch to sign in while the signup is pending
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.getByLabel('Email', { exact: true }).fill('signin@example.invalid')
    await page.getByLabel('Password', { exact: true }).fill('signin-password-2')
    // stale signup resolves with email confirmation required
    signup.resolve()
    await page.waitForTimeout(400)
    assert.equal(await page.getByRole('heading', { name: 'Welcome back' }).count(), 1, 'stays on the sign-in view')
    assert.equal(await page.getByRole('heading', { name: 'Check your email' }).count(), 0, 'check-email must not appear')
    assert.equal(await page.getByLabel('Email', { exact: true }).inputValue(), 'signin@example.invalid', 'new email untouched')
    assert.equal(await page.getByLabel('Password', { exact: true }).inputValue(), 'signin-password-2', 'new password untouched')
    assert.equal(await page.getByRole('button', { name: 'Sign in', exact: true }).isEnabled(), true, 'submit button not stuck busy')
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})
