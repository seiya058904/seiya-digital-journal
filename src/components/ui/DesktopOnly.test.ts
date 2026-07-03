import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHONE_VIEWPORT_QUERY,
  matchesPhoneViewport,
} from './DesktopOnly.ts'

test('phone viewport detection uses the shared mobile breakpoint', () => {
  let receivedQuery = ''

  const matches = matchesPhoneViewport((query) => {
    receivedQuery = query
    return { matches: true }
  })

  assert.equal(matches, true)
  assert.equal(receivedQuery, PHONE_VIEWPORT_QUERY)
  assert.equal(matchesPhoneViewport(undefined), false)
})
