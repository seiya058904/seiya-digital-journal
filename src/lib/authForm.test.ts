import assert from 'node:assert/strict'
import test from 'node:test'

import { maskEmailAddress, validateAuthField, validateAuthForm } from './authForm.ts'

test('signin validation rejects malformed email addresses', () => {
  assert.equal(
    validateAuthField('signin', 'email', {
      displayName: '',
      email: 'not-an-email',
      password: 'password123',
      confirmPassword: '',
    }),
    'Enter a valid email address.',
  )
})

test('signup validation rejects mismatched passwords', () => {
  assert.deepEqual(
    validateAuthForm('signup', {
      displayName: 'Seiya',
      email: 'seiya@example.com',
      password: 'password123',
      confirmPassword: 'password124',
    }),
    {
      confirmPassword: 'Passwords do not match.',
    },
  )
})

test('email masking keeps the address recognizable without exposing the full value', () => {
  assert.equal(maskEmailAddress('seiya@example.com'), 'se***@ex*****.com')
})
