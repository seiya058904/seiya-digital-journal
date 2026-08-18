import assert from 'node:assert/strict'
import test from 'node:test'

import { toggleBackgroundMode, type BackgroundMode } from './backgroundMode.ts'

test('toggleBackgroundMode cycles through the three site backgrounds', () => {
  const modes: BackgroundMode[] = ['default', 'beams', 'sliced-waves']

  assert.equal(toggleBackgroundMode('default'), 'beams')
  assert.equal(toggleBackgroundMode('beams'), 'sliced-waves')
  assert.equal(toggleBackgroundMode('sliced-waves'), 'default')
  assert.deepEqual(modes, ['default', 'beams', 'sliced-waves'])
})
