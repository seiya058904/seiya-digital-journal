import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldApplyProfileMutation } from './profileState.ts'

test('profile mutation applies only when the same user and newest request are still active', () => {
  assert.equal(
    shouldApplyProfileMutation({
      mounted: true,
      activeUserId: 'user-a',
      capturedUserId: 'user-a',
      currentRequestId: 3,
      capturedRequestId: 3,
    }),
    true,
  )
})

test('profile mutation is discarded after account switch', () => {
  assert.equal(
    shouldApplyProfileMutation({
      mounted: true,
      activeUserId: 'user-b',
      capturedUserId: 'user-a',
      currentRequestId: 3,
      capturedRequestId: 3,
    }),
    false,
  )
})

test('profile mutation is discarded when a newer request exists', () => {
  assert.equal(
    shouldApplyProfileMutation({
      mounted: true,
      activeUserId: 'user-a',
      capturedUserId: 'user-a',
      currentRequestId: 4,
      capturedRequestId: 3,
    }),
    false,
  )
})
