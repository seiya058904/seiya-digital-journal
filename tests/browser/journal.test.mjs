import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'
const user = { id: '00000000-0000-4000-8000-000000000018', aud: 'authenticated', role: 'authenticated', email: 'synthetic@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }
for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    test(`actual login and Archive lifecycle ${viewport.width}px ${reducedMotion}`, async () => {
      const browser = await chromium.launch()
      const page = await browser.newPage({ viewport, reducedMotion })
      page.setDefaultTimeout(15000)
      let posts = 0, fail = false
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      try {
        await page.route('**/*', async route => {
          const request = route.request(), url = request.url()
          if (url.startsWith(new URL(base).origin)) return route.continue()
          if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' })
          if (url.startsWith('https://synthetic.supabase.co/')) return route.fulfill({ headers: cors, json: { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user } })
          if (url.startsWith('https://api.example.invalid/')) {
            if (url.includes('/api/comments') && request.method() === 'POST') {
              posts++
              assert.equal(request.headers().authorization, 'Bearer synthetic-access')
              return route.fulfill({ headers: cors, status: fail ? 503 : 200, json: fail ? { ok: false, error: { code: 'TEST_FAILURE', message: 'Synthetic comment failure' } } : { ok: true, data: { id: 'synthetic-comment' } } })
            }
            return route.fulfill({ headers: cors, json: { ok: true, data: url.includes('/profile/') ? { profile: { displayName: 'Synthetic', avatarKey: 'avatar-01', email: user.email, memberSince: user.created_at }, stats: { comments: 0, likes: 0 } } : url.includes('likes') ? { count: 0 } : [] } })
          }
          return route.abort()
        })
        await page.goto(base + '#/auth')
        assert.equal(await page.getByLabel('Keep me signed in').isChecked(), false)
        await page.getByLabel('Email', { exact: true }).fill(user.email)
        await page.getByLabel('Password', { exact: true }).fill('synthetic-password')
        await page.getByRole('button', { name: 'Sign in', exact: true }).click()
        await page.waitForURL(base + '#/')
        await page.goto(base + '#/archive')
        const stepper = page.getByRole('region', { name: 'Journal stepper' })
        const enterComment = async () => {
          await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
          await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
          await page.getByLabel('One thought from today').fill('Synthetic browser thought')
          await stepper.getByRole('button', { name: 'Continue', exact: true }).click()
        }
        await enterComment()
        await stepper.getByRole('button', { name: 'Complete', exact: true }).click()
        await page.getByText('Comment published.', { exact: true }).waitFor()
        assert.equal(posts, 1)
        assert.equal(await page.evaluate(() => sessionStorage.getItem('archive-stepper-step')), '1')
        await stepper.getByRole('button', { name: 'Continue', exact: true }).waitFor()
        assert.equal(await page.getByRole('heading', { name: 'Welcome to the journal.' }).isVisible(), true)
        fail = true
        await enterComment()
        await stepper.getByRole('button', { name: 'Complete', exact: true }).click()
        await page.getByText('Synthetic comment failure', { exact: true }).waitFor()
        assert.equal(await page.evaluate(() => sessionStorage.getItem('archive-stepper-step')), '4')
        assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('archive-stepper-thought'))), 'Synthetic browser thought')
        fail = false
        await stepper.getByRole('button', { name: 'Complete', exact: true }).click()
        await page.getByText('Comment published.', { exact: true }).waitFor()
        await page.goto(base + '#/')
        await page.goto(base + '#/archive')
        await stepper.getByRole('button', { name: 'Continue', exact: true }).waitFor()
        assert.equal(posts, 3)
        await page.reload()
        await stepper.getByRole('button', { name: 'Continue', exact: true }).waitFor()
        await page.getByRole('button', { name: 'Go to step 3', exact: true }).click()
        await page.getByText('Sign in to publish this comment.', { exact: false }).waitFor()
        assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => key.endsWith('-auth-token'))), false)
        assert.deepEqual(errors, [])
      } finally { await browser.close() }
    })
  }
}
