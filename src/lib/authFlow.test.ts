import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAuthSuccessOutcome } from './authFlow.ts'

test('sign in success resolves to redirect feedback', () => {
  assert.deepEqual(resolveAuthSuccessOutcome('signin', 'seiya@example.com', false), {
    kind: 'redirect',
    message: 'Signed in successfully.',
  })
})

test('sign up success with session resolves to redirect feedback', () => {
  assert.deepEqual(resolveAuthSuccessOutcome('signup', 'seiya@example.com', false), {
    kind: 'redirect',
    message: 'Account created successfully.',
  })
})

test('sign up without session resolves to the dedicated check-email state', () => {
  assert.deepEqual(resolveAuthSuccessOutcome('signup', 'seiya@example.com', true), {
    kind: 'check-email',
    message: 'Check your email to confirm your account.',
    maskedEmail: 'se***@ex*****.com',
  })
})
