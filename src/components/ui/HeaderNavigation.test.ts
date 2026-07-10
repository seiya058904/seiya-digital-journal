import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const SRC_DIR = resolve(import.meta.dirname, '../..')

test('Motion Lab stays in desktop navigation but not the mobile menu', () => {
  const header = readFileSync(resolve(import.meta.dirname, 'Header.tsx'), 'utf8')
  const app = readFileSync(resolve(SRC_DIR, 'App.tsx'), 'utf8')

  assert.match(header, /label: 'Motion Lab', href: '#\/lab'/)
  assert.doesNotMatch(header, /<a href="#\/lab"/)
  assert.match(app, /hash === '#\/lab' \|\| hash === '#\/motion-lab'/)
})
