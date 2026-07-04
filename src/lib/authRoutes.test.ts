import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_RETURN_TARGET_KEY,
  AUTH_ROUTE,
  consumeAuthReturnTarget,
  getAuthReturnTarget,
  navigateToAuth,
  normalizeAuthReturnTarget,
  setAuthReturnTarget,
} from './authRoutes.ts'

function installMockWindow(hash = '#/') {
  const storage = new Map<string, string>()
  const windowMock = {
    location: {
      hash,
    },
    sessionStorage: {
      getItem(key: string) {
        return storage.has(key) ? storage.get(key)! : null
      },
      setItem(key: string, value: string) {
        storage.set(key, value)
      },
      removeItem(key: string) {
        storage.delete(key)
      },
    },
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: windowMock,
  })

  return {
    storage,
    restore() {
      delete (globalThis as { window?: unknown }).window
    },
  }
}

test('auth return target falls back to home for external routes', () => {
  assert.equal(normalizeAuthReturnTarget('https://example.com/elsewhere'), '#/')
  assert.equal(normalizeAuthReturnTarget('#about'), '#/')
})

test('auth return target save and consume stay inside internal hash routes', () => {
  const mock = installMockWindow()
  setAuthReturnTarget('#/archive')
  assert.equal(getAuthReturnTarget(), '#/archive')
  assert.equal(consumeAuthReturnTarget(), '#/archive')
  assert.equal(mock.storage.has(AUTH_RETURN_TARGET_KEY), false)
  mock.restore()
})

test('navigateToAuth records the current route before switching to auth', () => {
  const mock = installMockWindow('#/archive')
  navigateToAuth('#/archive')
  assert.equal(mock.storage.get(AUTH_RETURN_TARGET_KEY), '#/archive')
  assert.equal(window.location.hash, AUTH_ROUTE)
  mock.restore()
})
