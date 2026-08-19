import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

import { resolvePageFromHash } from '../../appRoute.ts'

test('Motion Lab stays in desktop navigation but not the mobile menu', () => {
  const header = readFileSync(resolve(import.meta.dirname, 'Header.tsx'), 'utf8')

  assert.match(header, /label: 'Motion Lab', href: '#\/lab'/)
  assert.doesNotMatch(header, /<a href="#\/lab"/)
  assert.match(header, /event\.preventDefault\(\)/)
  assert.match(header, /onItemClick=\{\(item, event\) => handleNavigation\(item\.href, event\)\}/)
  assert.match(header, /onLinkClick=\{\(link, event\) => handleNavigation\(link\.href, event\)\}/)
  assert.equal(resolvePageFromHash('#/lab'), 'lab')
  assert.equal(resolvePageFromHash('#/motion-lab'), 'lab')
})
