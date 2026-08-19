import test from 'node:test'
import assert from 'node:assert/strict'

import { getSmoothScrollMode } from './smoothScroll.ts'

test('enables Lenis only for fine-pointer devices without reduced motion', () => {
  assert.equal(getSmoothScrollMode({ finePointer: true, reducedMotion: false }), 'lenis')
  assert.equal(getSmoothScrollMode({ finePointer: false, reducedMotion: false }), 'native')
  assert.equal(getSmoothScrollMode({ finePointer: true, reducedMotion: true }), 'native')
})
