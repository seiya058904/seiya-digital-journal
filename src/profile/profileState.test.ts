import assert from 'node:assert/strict'
import test from 'node:test'

import { shouldApplyProfileMutation, shouldApplyProfileReadResult } from './profileState.ts'

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

test('profile read result applies while mounted and not superseded', () => {
  assert.equal(
    shouldApplyProfileReadResult({ mounted: true, currentReadRequestId: 3, capturedReadRequestId: 3 }),
    true,
  )
})

test('profile read result is discarded when a newer read or successful save bumped the counter', () => {
  assert.equal(
    shouldApplyProfileReadResult({ mounted: true, currentReadRequestId: 5, capturedReadRequestId: 3 }),
    false,
  )
})

test('profile read result is discarded after unmount', () => {
  assert.equal(
    shouldApplyProfileReadResult({ mounted: false, currentReadRequestId: 3, capturedReadRequestId: 3 }),
    false,
  )
})
