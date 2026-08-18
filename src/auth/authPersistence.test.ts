import assert from 'node:assert/strict'
import test from 'node:test'

import {
  REMEMBER_ME_STORAGE_KEY,
  createAuthStorage,
  setRememberMe,
} from './authPersistence.ts'

function createMemoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  }
}

test('remember me persists auth storage only when enabled', () => {
  const storage = createMemoryStorage()
  const authStorage = createAuthStorage(storage)

  authStorage.setItem('auth-token', 'session')
  assert.equal(storage.values.has('auth-token'), false)

  setRememberMe(storage, true)
  authStorage.setItem('auth-token', 'session')
  assert.equal(storage.values.get('auth-token'), 'session')
  assert.equal(storage.values.get(REMEMBER_ME_STORAGE_KEY), 'true')
})

test('remember me storage ignores persisted sessions when disabled', () => {
  const storage = createMemoryStorage()
  setRememberMe(storage, true)
  storage.setItem('auth-token', 'session')
  setRememberMe(storage, false)

  const authStorage = createAuthStorage(storage)
  assert.equal(authStorage.getItem('auth-token'), null)
  assert.equal(storage.values.has(REMEMBER_ME_STORAGE_KEY), false)
})
