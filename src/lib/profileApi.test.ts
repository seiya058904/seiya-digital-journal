import assert from 'node:assert/strict'
import test from 'node:test'

import { parseProfileResponse } from './profileApi.ts'

test('parseProfileResponse keeps the profile fields and stats from api data', () => {
  assert.deepEqual(
    parseProfileResponse({
      profile: {
        displayName: 'Sia',
        avatarKey: 'avatar-03',
        email: 'sia@example.com',
        memberSince: '2026-07-01T00:00:00.000Z',
      },
      stats: {
        comments: 12,
        likes: 28,
      },
    }),
    {
      profile: {
        displayName: 'Sia',
        avatarKey: 'avatar-03',
        email: 'sia@example.com',
        memberSince: '2026-07-01T00:00:00.000Z',
      },
      stats: {
        comments: 12,
        likes: 28,
      },
    },
  )
})

test('parseProfileResponse rejects malformed payloads', () => {
  assert.throws(
    () => parseProfileResponse({ profile: null, stats: {} }),
    /Invalid profile response/,
  )
})
