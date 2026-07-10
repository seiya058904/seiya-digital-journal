import assert from 'node:assert/strict'
import test from 'node:test'

import { isStackClickEnabled } from './stackState.ts'

test('stack click enablement preserves desktop behavior', () => {
  assert.equal(isStackClickEnabled(false, true, false), true)
  assert.equal(isStackClickEnabled(false, false, true), true)
  assert.equal(isStackClickEnabled(false, false, false), false)
})

test('stack enables mobile click only when mobileClickOnly requests it', () => {
  assert.equal(isStackClickEnabled(true, true, false), false)
  assert.equal(isStackClickEnabled(true, false, true), true)
})
