import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'
const user = { id: '00000000-0000-4000-8000-0000000000b0', aud: 'authenticated', role: 'authenticated', email: 'synthetic-b@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
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
  let posts = 0
  const route = async route => {
    const request = route.request(), url = request.url()
    if (url.startsWith(new URL(base).origin)) return route.continue()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' })
    if (url.startsWith('https://synthetic.supabase.co/')) {
      return route.fulfill({ headers: cors, json: { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user } })
    }
    if (url.startsWith('https://api.example.invalid/')) {
      if (url.includes('/api/comments') && request.method() === 'POST') {
        posts++
        return route.fulfill({ headers: cors, json: { ok: true, data: { id: 'synthetic-comment' } } })
      }
      return route.fulfill({ headers: cors, json: { ok: true, data: url.includes('/profile/') ? { profile: { displayName: 'Synthetic', avatarKey: 'avatar-01', email: user.email, memberSince: user.created_at }, stats: { comments: 0, likes: 0 } } : url.includes('likes') ? { count: 0 } : [] } })
    }
    return route.abort()
  }
  const newPage = async () => {
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', route)
    return page
  }
  const signIn = async (page, remember) => {
    await page.goto(base + '#/auth')
    if (remember) await page.getByLabel('Keep me signed in').check()
    await page.getByLabel('Email', { exact: true }).fill(user.email)
    await page.getByLabel('Password', { exact: true }).fill('synthetic-password')
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await page.waitForURL(base + '#/')
    await page.locator('.account-menu__chip').first().waitFor()
  }

  try {
    const pageA = await newPage()
    const pageB = await newPage()

    // Tab A signs in without Remember me: page-local temporary session.
    await signIn(pageA, false)
    // Tab B signs in with Remember me: publishes the shared persistent session.
    await signIn(pageB, true)
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

    // The remembered session published by tab B must survive tab A's reads.
    assert.notEqual(await pageA.evaluate(key => localStorage.getItem(key), tokenKey), null)
    assert.notEqual(await pageB.evaluate(key => localStorage.getItem(key), tokenKey), null)

    // Tab B still works and stays signed in after its own reload.
    await pageB.reload()
    await pageB.locator('.account-menu__chip').first().waitFor()

    // A fresh page restores the remembered login.
    const pageC = await newPage()
    await pageC.goto(base)
    await pageC.locator('.account-menu__chip').first().waitFor()
    await pageC.close()

    // Tab A's temporary session is untouched by the other tab's login.
    assert.equal(await pageA.locator('.account-menu__chip').count() >= 1, true)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
