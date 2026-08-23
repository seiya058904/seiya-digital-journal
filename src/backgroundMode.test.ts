import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BACKGROUND_MODE_STORAGE_KEY,
  DEFAULT_BACKGROUND_MODE,
  readBackgroundMode,
  saveBackgroundMode,
  toggleBackgroundMode,
  type BackgroundMode,
} from './backgroundMode.ts'

test('uses sliced waves when no saved background preference exists', () => {
  assert.equal(DEFAULT_BACKGROUND_MODE, 'sliced-waves')
  assert.equal(readBackgroundMode(null), 'sliced-waves')
})

test('toggleBackgroundMode cycles through the three site backgrounds', () => {
  const modes: BackgroundMode[] = ['default', 'beams', 'sliced-waves']

  assert.equal(toggleBackgroundMode('default'), 'beams')
  assert.equal(toggleBackgroundMode('beams'), 'sliced-waves')
  assert.equal(toggleBackgroundMode('sliced-waves'), 'default')
  assert.deepEqual(modes, ['default', 'beams', 'sliced-waves'])
})

test('readBackgroundMode restores only valid saved modes', () => {
  const values = new Map<string, string>([[BACKGROUND_MODE_STORAGE_KEY, 'beams']])
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }

  assert.equal(readBackgroundMode(storage), 'beams')
  values.set(BACKGROUND_MODE_STORAGE_KEY, 'unknown')
  assert.equal(readBackgroundMode(storage), 'sliced-waves')
})

test('background mode persistence degrades when storage is unavailable', () => {
  const storage = {
    getItem() {
      throw new Error('storage unavailable')
    },
    setItem() {
      throw new Error('storage unavailable')
    },
  }

  assert.equal(readBackgroundMode(storage), 'sliced-waves')
  assert.doesNotThrow(() => saveBackgroundMode(storage, 'sliced-waves'))
})
