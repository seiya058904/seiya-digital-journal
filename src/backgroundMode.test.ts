import assert from 'node:assert/strict'
import test from 'node:test'

import { toggleBackgroundMode, type BackgroundMode } from './backgroundMode.ts'

test('toggleBackgroundMode switches between the two site backgrounds', () => {
  const modes: BackgroundMode[] = ['default', 'beams']

  assert.equal(toggleBackgroundMode('default'), 'beams')
  assert.equal(toggleBackgroundMode('beams'), 'default')
  assert.deepEqual(modes, ['default', 'beams'])
})
