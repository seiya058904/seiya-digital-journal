import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSiteUrl } from './site.ts'

test('buildSiteUrl preserves the GitHub Pages subpath', () => {
  assert.equal(
    buildSiteUrl('https://seiya058904.github.io', '/seiya-digital-journal/'),
    'https://seiya058904.github.io/seiya-digital-journal/',
  )
})

test('buildSiteUrl handles localhost root paths', () => {
  assert.equal(
    buildSiteUrl('http://localhost:5173', '/'),
    'http://localhost:5173/',
  )
})
