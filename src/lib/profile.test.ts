import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_PROFILE_AVATAR_KEY,
  PROFILE_AVATAR_KEYS,
  extractExactCount,
  getBootstrapDisplayName,
  validateProfileAvatarKey,
  validateProfileDisplayName,
} from './profile.ts'

test('profile avatar keys stay stable and start with the default key', () => {
  assert.deepEqual(PROFILE_AVATAR_KEYS, [
    'avatar-01',
    'avatar-02',
    'avatar-03',
    'avatar-04',
    'avatar-05',
    'avatar-06',
    'avatar-07',
    'avatar-08',
    'avatar-09',
  ])
  assert.equal(DEFAULT_PROFILE_AVATAR_KEY, 'avatar-01')
})

test('profile display name trims surrounding whitespace before acceptance', () => {
  assert.deepEqual(validateProfileDisplayName('  Sia  '), {
    ok: true,
    value: 'Sia',
  })
})

test('profile display name rejects empty content after trimming', () => {
  assert.deepEqual(validateProfileDisplayName('   '), {
    ok: false,
    code: 'INVALID_DISPLAY_NAME',
  })
})

test('profile display name rejects values longer than 80 characters', () => {
  assert.deepEqual(validateProfileDisplayName('a'.repeat(81)), {
    ok: false,
    code: 'INVALID_DISPLAY_NAME',
  })
})

test('profile avatar key accepts known preset avatars only', () => {
  assert.deepEqual(validateProfileAvatarKey('avatar-03'), {
    ok: true,
    value: 'avatar-03',
  })
})

test('profile avatar key rejects unknown values', () => {
  assert.deepEqual(validateProfileAvatarKey('../avatar-99'), {
    ok: false,
    code: 'INVALID_AVATAR_KEY',
  })
})

test('profile bootstrap name falls back to User when auth metadata is blank', () => {
  assert.equal(getBootstrapDisplayName('   '), 'User')
})

test('extractExactCount reads the exact total from a content-range header', () => {
  assert.equal(extractExactCount('0-0/28'), 28)
})

test('extractExactCount accepts a zero total', () => {
  assert.equal(extractExactCount('0-0/0'), 0)
})

test('extractExactCount accepts a single-row total', () => {
  assert.equal(extractExactCount('0-0/1'), 1)
})

test('extractExactCount rejects missing totals', () => {
  assert.throws(() => extractExactCount(null), /Unable to read count/)
})

test('extractExactCount rejects malformed totals', () => {
  assert.throws(() => extractExactCount('malformed'), /Unable to read count/)
})
