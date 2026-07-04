import assert from 'node:assert/strict'
import test from 'node:test'

import { isOriginAllowed, parseAllowedOrigins } from './cors.ts'

test('parseAllowedOrigins trims and deduplicates origin entries', () => {
  assert.deepEqual(
    parseAllowedOrigins('https://seiya058904.github.io, http://localhost:5173 , https://seiya058904.github.io'),
    ['https://seiya058904.github.io', 'http://localhost:5173'],
  )
})

test('isOriginAllowed accepts an allowed origin', () => {
  assert.equal(
    isOriginAllowed('https://seiya058904.github.io', ['https://seiya058904.github.io', 'http://localhost:5173']),
    true,
  )
})

test('isOriginAllowed rejects an origin outside the allowlist', () => {
  assert.equal(
    isOriginAllowed('https://evil.example', ['https://seiya058904.github.io', 'http://localhost:5173']),
    false,
  )
})
