import assert from 'node:assert/strict'
import test from 'node:test'
import { chromium } from 'playwright'

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4178/seiya-digital-journal/'

async function withPage(options, run) {
  const browser = await chromium.launch()
  const page = await browser.newPage(options)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = route.request().url()
    if (url.startsWith(new URL(base).origin)) return route.continue()
    if (url.startsWith('https://api.example.invalid/')) {
      return route.fulfill({ headers: { 'Access-Control-Allow-Origin': '*' }, json: { ok: true, data: url.includes('likes') ? { count: 0 } : [] } })
    }
    return route.abort()
  })
  try {
    await run(page)
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
}

test('hero portrait respects its column at phone, tablet and desktop widths', async () => {
  await withPage({ reducedMotion: 'reduce' }, async page => {
    for (const width of [375, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(base)
      await page.getByRole('link', { name: 'View profile', exact: true }).waitFor()
      await page.waitForTimeout(1000)
      const geometry = await page.evaluate(() => {
        const copy = document.querySelector('.hero__copy').getBoundingClientRect()
        const card = document.querySelector('.hero .pc-card')?.getBoundingClientRect()
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          overlap: card ? Math.min(copy.right, card.right) - Math.max(copy.left, card.left) > 1 && Math.min(copy.bottom, card.bottom) - Math.max(copy.top, card.top) > 1 : false,
          cardWidth: card?.width,
          actionsBottom: document.querySelector('.hero__actions').getBoundingClientRect().bottom,
        }
      })
      assert.equal(geometry.overflow, false, `${width}px overflow`)
      assert.equal(geometry.overlap, false, `${width}px overlap`)
      if (width === 1024) assert.ok(geometry.actionsBottom < 800)
      if (width === 1440) assert.ok(geometry.cardWidth > 300, 'desktop portrait retains its visual size')
    }
  })
})

test('reading text and auth validation retain readable, distinct computed styles', async () => {
  await withPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    await page.goto(base + '#/archive/notes/learning-as-system')
    const chinese = page.locator('.archive-note-detail__section-chinese').first()
    await chinese.waitFor()
    assert.ok(await chinese.evaluate(e => parseFloat(getComputedStyle(e).fontSize)) >= 14)
    assert.equal(await chinese.evaluate(e => getComputedStyle(e).color), 'rgb(186, 197, 220)')
    await page.goto(base + '#/auth')
    await page.getByLabel('Email', { exact: true }).fill('invalid')
    await page.getByLabel('Password', { exact: true }).focus()
    const error = page.getByText('Enter a valid email address.', { exact: true })
    await error.waitFor()
    assert.equal(await error.evaluate(e => getComputedStyle(e).color), 'rgb(255, 180, 180)')
    assert.ok(await error.evaluate(e => parseFloat(getComputedStyle(e).fontSize)) >= 14)
    const email = page.getByRole('textbox', { name: /^Email/ })
    assert.equal(await email.getAttribute('aria-invalid'), 'true')
    await email.fill('reader@example.invalid')
    await page.keyboard.press('Tab')
    assert.equal(await error.count(), 0)
    assert.equal(await email.getAttribute('aria-invalid'), null)
  })
})

test('Explore stays closed or open consistently across live motion preference changes', async () => {
  await withPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, async page => {
    await page.goto(base)
    const trigger = page.locator('.hamburger-menu')
    const panel = page.locator('.card-nav-content')
    await trigger.waitFor()
    const checkClosed = async () => {
      await page.waitForFunction(() => document.querySelector('.hamburger-menu')?.getAttribute('aria-expanded') === 'false')
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      assert.equal(await panel.getAttribute('aria-hidden'), 'true')
      assert.equal(await panel.evaluate(e => getComputedStyle(e).visibility), 'hidden')
      assert.ok(await page.locator('.card-nav').evaluate(e => e.getBoundingClientRect().height) <= 61)
      assert.ok((await panel.locator('a').evaluateAll(es => es.map(e => e.tabIndex))).every(index => index === -1))
    }
    const checkOpen = async () => {
      await page.waitForFunction(() => [...document.querySelectorAll('.nav-card')].every(e => getComputedStyle(e).opacity === '1'))
      assert.equal(await trigger.getAttribute('aria-expanded'), 'true')
      assert.equal(await panel.getAttribute('aria-hidden'), 'false')
      assert.ok((await page.locator('.nav-card').evaluateAll(es => es.map(e => Number(getComputedStyle(e).opacity)))).every(opacity => opacity === 1))
      const bounds = await panel.locator('a').evaluateAll(es => es.map(e => {
        const link = e.getBoundingClientRect(), nav = e.closest('.card-nav').getBoundingClientRect()
        return link.bottom <= nav.bottom + 1 && link.top >= nav.top
      }))
      assert.ok(bounds.every(Boolean), 'all open links fit the menu')
    }
    await checkClosed()
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    await checkOpen()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(100)
    await checkClosed()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await trigger.click()
    await page.waitForTimeout(100)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(100)
    await checkOpen()
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.waitForTimeout(100)
    await checkOpen()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await trigger.click()
    await page.waitForTimeout(100)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(100)
    await checkClosed()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await trigger.click()
    await checkOpen()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await page.setViewportSize({ width: 1440, height: 900 })
    await checkClosed()
  })
})

test('navigation follows homepage sections and Archive descendant routes', async () => {
  await withPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }, async page => {
    await page.goto(base)
    for (const label of ['About', 'Gallery', 'Thoughts', 'Contact', 'Home']) {
      await page.locator('.pill').getByText(label, { exact: true }).first().click()
      await page.waitForFunction(href => document.querySelector('.pill.is-active')?.getAttribute('href') === href, '#' + label.toLowerCase())
    }
    for (const route of ['#/archive', '#/archive/images', '#/archive/notes', '#/archive/notes/learning', '#/archive/notes/learning-as-system', '#/archive/projects', '#/gallery']) {
      await page.goto(base + route)
      await page.locator('main h1').waitFor()
      assert.equal(await page.locator('.pill.is-active').getAttribute('href'), '#/archive')
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Open navigation' }).click()
    assert.equal(await page.locator('.nav-links .is-active').getAttribute('href'), '#/archive')
    await page.locator('.nav-links').getByRole('link', { name: 'About', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.nav-links .is-active')?.getAttribute('href') === '#about')
    assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false')
  })
})

test('Archive responds to reduced motion without a reload and restores normal background', async () => {
  await withPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' }, async page => {
    await page.goto(base + '#/archive')
    await page.locator('.archive-bg canvas').waitFor()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.locator('.archive-bg canvas').waitFor({ state: 'detached' })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.locator('.archive-bg canvas').waitFor()
  })
})
