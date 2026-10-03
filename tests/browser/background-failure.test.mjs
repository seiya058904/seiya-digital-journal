import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'

for (const [failure, mode] of [
  ['no-webgl', 'sliced-waves'], ['no-webgl', 'beams'], ['no-webgl', 'default'],
  ['webgl1-only', 'sliced-waves'], ['partial-init', 'sliced-waves'], ['none', 'sliced-waves'], ['reduced-motion', 'sliced-waves'],
]) {
  test(`decorative background stays isolated: ${failure}/${mode}`, async () => {
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: failure === 'reduced-motion' ? 'reduce' : 'no-preference' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/*', route => {
        const url = route.request().url()
        if (url.startsWith(new URL(base).origin)) return route.continue()
        const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }
        if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
        if (url.startsWith('https://synthetic.supabase.co/')) return route.fulfill({ headers, json: {
          access_token: 'synthetic-no-webgl', refresh_token: 'synthetic-refresh', expires_in: 3600, token_type: 'bearer',
          user: { id: '00000000-0000-4000-8000-000000000021', email: 'synthetic@example.invalid', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' },
        } })
        if (url.startsWith('https://api.example.invalid/')) return route.fulfill({ headers, json: { ok: true, data: url.includes('/profile/')
          ? { profile: { displayName: 'Synthetic', email: 'synthetic@example.invalid', avatarKey: 'avatar-01', memberSince: '2026-01-01' }, stats: { comments: 0, likes: 0 } } : [] } })
        return route.abort()
      })
      await page.addInitScript(({ failure, mode }) => {
        localStorage.setItem('seiya-background-mode', mode)
        window.webglProbe = { attempts: 0, lost: 0, disconnected: 0 }
        const original = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          if (type === 'webgl' || type === 'webgl2') {
            window.webglProbe.attempts++
            if (failure === 'no-webgl' || (failure === 'webgl1-only' && type === 'webgl2')) return null
          }
          const context = original.call(this, type, ...args)
          if (context && (type === 'webgl' || type === 'webgl2') && !context.probed) {
            context.probed = true
            const getExtension = context.getExtension.bind(context)
            context.getExtension = name => {
              const extension = getExtension(name)
              if (name === 'WEBGL_lose_context' && extension) return { loseContext: () => { window.webglProbe.lost++; extension.loseContext() } }
              return extension
            }
          }
          return context
        }
        const OriginalObserver = ResizeObserver
        window.ResizeObserver = class extends OriginalObserver {
          observe(target, ...args) {
            this.sliced = target.classList.contains('sliced-waves-container')
            if (this.sliced && failure === 'partial-init') throw new Error('synthetic resize initialization failure')
            return super.observe(target, ...args)
          }
          disconnect() { if (this.sliced) window.webglProbe.disconnected++; super.disconnect() }
        }
      }, { failure, mode })
      await page.goto(base)
      await page.locator('main').waitFor()
      await page.locator('.site-header').waitFor()
      const expectedStatic = failure !== 'none'
      if (expectedStatic) await page.locator('.site-background .site-background__static').waitFor()
      else await page.locator('.sliced-waves-container canvas').waitFor()
      await page.reload()
      await page.locator('main').waitFor()
      if (expectedStatic) await page.locator('.site-background .site-background__static').waitFor()
      else await page.locator('.sliced-waves-container canvas').waitFor()
      await page.locator('.header-auth__button').click()
      await page.getByLabel('Email', { exact: true }).fill('synthetic@example.invalid')
      await page.getByLabel('Password', { exact: true }).fill('synthetic-password')
      await page.getByRole('button', { name: 'Sign in', exact: true }).click()
      await page.locator('.account-menu__chip').waitFor()
      await page.goto(base + '#/archive')
      await page.getByRole('region', { name: 'Journal stepper' }).waitFor()
      const probe = await page.evaluate(() => window.webglProbe)
      if (failure === 'partial-init' || failure === 'none') {
        assert.ok(probe.lost > 0, JSON.stringify(probe))
        assert.ok(probe.disconnected > 0, JSON.stringify(probe))
      }
      if (failure === 'reduced-motion') assert.equal(probe.attempts, 0)
      assert.deepEqual(errors, [])
    } finally { await browser.close() }
  })
}
