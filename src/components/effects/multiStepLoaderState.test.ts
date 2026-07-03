import assert from 'node:assert/strict'
import test from 'node:test'

import { getNextLoaderState } from './multiStepLoaderState.ts'

test('a non-looping loader completes after its final step', () => {
  assert.equal(getNextLoaderState(0, 4, false), 1)
  assert.equal(getNextLoaderState(3, 4, false), null)
})

test('looping remains available when explicitly requested', () => {
  assert.equal(getNextLoaderState(3, 4, true), 0)
})
