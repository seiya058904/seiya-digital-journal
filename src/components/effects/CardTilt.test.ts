import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateTilt } from './tilt.ts'

test('calculateTilt centers at zero and respects intensity at the edges', () => {
  assert.deepEqual(calculateTilt(50, 50, 100, 100, 8), { rotateX: 0, rotateY: 0 })
  assert.deepEqual(calculateTilt(100, 0, 100, 100, 8), { rotateX: 8, rotateY: 8 })
})
