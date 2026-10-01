import assert from 'node:assert/strict'
import test from 'node:test'
import { REMEMBER_ME_STORAGE_KEY, createAuthStorage } from './authPersistence.ts'

function createMemoryStorage() {
  const values = new Map<string, string>()
  return { values, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) } }
}

test('temporary session is readable on this page but never on a new page', () => {
  const storage = createMemoryStorage()
  const auth = createAuthStorage(storage)
  auth.setItem('auth-token', 'session')
  assert.equal(auth.getItem('auth-token'), 'session')
  assert.equal(storage.getItem('auth-token'), null)
  assert.equal(createAuthStorage(storage).getItem('auth-token'), null)
})

test('remembered session restores and mode changes migrate only the current session', () => {
  const storage = createMemoryStorage()
  const auth = createAuthStorage(storage)
  auth.setRememberMe(true)
  auth.setItem('auth-token', 'account-A')
  assert.equal(storage.getItem(REMEMBER_ME_STORAGE_KEY), 'true')
  const restored = createAuthStorage(storage)
  assert.equal(restored.getItem('auth-token'), 'account-A')
  restored.setRememberMe(false)
  assert.equal(restored.getItem('auth-token'), 'account-A')
  assert.equal(storage.getItem('auth-token'), null)
  restored.setItem('auth-token', 'account-B')
  restored.setRememberMe(true)
  assert.equal(createAuthStorage(storage).getItem('auth-token'), 'account-B')
  restored.removeItem('auth-token')
  restored.setRememberMe(false)
  restored.setRememberMe(true)
  assert.equal(restored.getItem('auth-token'), null)
  assert.equal(createAuthStorage(storage).getItem('auth-token'), null)
})

test('disabled persistence removes stale sessions before later enabling it', () => {
  const storage = createMemoryStorage()
  storage.setItem('auth-token', 'old-account')
  const auth = createAuthStorage(storage)
  assert.equal(auth.getItem('auth-token'), null)
  auth.setRememberMe(true)
  assert.equal(auth.getItem('auth-token'), null)
  assert.equal(storage.getItem('auth-token'), null)
})

test('unavailable storage and quota failures keep a readable temporary session', () => {
  for (const storage of [null, {getItem(){ throw Error('denied') },setItem(){ throw Error('denied') },removeItem(){ throw Error('denied') }},
    {getItem(){ return null },setItem(){ throw Error('quota') },removeItem(){ throw Error('denied') }}]) {
    const auth = createAuthStorage(storage)
    auth.setRememberMe(true)
    auth.setItem('auth-token', 'session')
    assert.equal(auth.getItem('auth-token'), 'session')
    auth.removeItem('auth-token')
    assert.equal(auth.getItem('auth-token'), null)
  }
})

test('remembered mode observes external storage updates instead of stale cached sessions', () => {
  const storage = createMemoryStorage()
  const auth = createAuthStorage(storage)
  auth.setRememberMe(true)
  auth.setItem('auth-token', 'session')
  storage.removeItem('auth-token')
  assert.equal(auth.getItem('auth-token'), null)
})
