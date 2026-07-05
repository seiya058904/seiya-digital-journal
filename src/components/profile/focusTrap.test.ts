import assert from 'node:assert/strict'
import test from 'node:test'

import { getWrappedFocusTarget } from './focusTrap.ts'

test('focus trap wraps Tab from the last item back to the first', () => {
  assert.equal(getWrappedFocusTarget({
    activeIndex: 4,
    focusableCount: 5,
    shiftKey: false,
  }), 0)
})

test('focus trap wraps Shift+Tab from the first item back to the last', () => {
  assert.equal(getWrappedFocusTarget({
    activeIndex: 0,
    focusableCount: 5,
    shiftKey: true,
  }), 4)
})

test('focus trap leaves middle items alone', () => {
  assert.equal(getWrappedFocusTarget({
    activeIndex: 2,
    focusableCount: 5,
    shiftKey: false,
  }), null)
})
