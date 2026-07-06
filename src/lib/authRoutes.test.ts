import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AUTH_RETURN_TARGET_KEY,
  AUTH_ROUTE,
  clearAuthReturnTarget,
  consumeAuthReturnTarget,
  shouldRedirectProfileToAuth,
  getPreSignOutRoute,
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

test('pre-sign-out route leaves protected profile before auth state changes', () => {
  assert.equal(getPreSignOutRoute('#/profile'), '#/')
  assert.equal(getPreSignOutRoute('#/auth'), '#/')
  assert.equal(getPreSignOutRoute('#/archive'), null)
})

test('clearAuthReturnTarget removes any stored redirect target', () => {
  const mock = installMockWindow('#/profile')
  setAuthReturnTarget('#/profile')
  clearAuthReturnTarget()
  assert.equal(mock.storage.has(AUTH_RETURN_TARGET_KEY), false)
  mock.restore()
})

test('profile auth guard does not redirect while auth is loading', () => {
  assert.equal(shouldRedirectProfileToAuth({
    loading: true,
    isAuthenticated: false,
    currentRoute: '#/profile',
  }), false)
})

test('profile auth guard does not redirect for authenticated users', () => {
  assert.equal(shouldRedirectProfileToAuth({
    loading: false,
    isAuthenticated: true,
    currentRoute: '#/profile',
  }), false)
})

test('profile auth guard redirects only for unauthenticated users still on #/profile', () => {
  assert.equal(shouldRedirectProfileToAuth({
    loading: false,
    isAuthenticated: false,
    currentRoute: '#/profile',
  }), true)
})

test('profile auth guard does not redirect after explicit sign-out already moved to home', () => {
  assert.equal(shouldRedirectProfileToAuth({
    loading: false,
    isAuthenticated: false,
    currentRoute: '#/',
  }), false)
})

test('profile auth guard does not redirect from auth route', () => {
  assert.equal(shouldRedirectProfileToAuth({
    loading: false,
    isAuthenticated: false,
    currentRoute: '#/auth',
  }), false)
})

function installThrowingStorageWindow() {
  const windowMock = {
    location: { hash: '#/' },
    sessionStorage: {
      getItem() { throw new Error('storage unavailable') },
      setItem() { throw new Error('storage unavailable') },
      removeItem() { throw new Error('storage unavailable') },
    },
  }

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: windowMock,
  })

  return {
    restore() {
      delete (globalThis as { window?: unknown }).window
    },
  }
}

test('setAuthReturnTarget does not throw when sessionStorage.setItem fails', () => {
  const mock = installThrowingStorageWindow()
  assert.doesNotThrow(() => setAuthReturnTarget('#/archive'))
  mock.restore()
})

test('getAuthReturnTarget returns home route when sessionStorage.getItem fails', () => {
  const mock = installThrowingStorageWindow()
  assert.equal(getAuthReturnTarget(), '#/')
  mock.restore()
})

test('clearAuthReturnTarget does not throw when sessionStorage.removeItem fails', () => {
  const mock = installThrowingStorageWindow()
  assert.doesNotThrow(() => clearAuthReturnTarget())
  mock.restore()
})

test('consumeAuthReturnTarget returns target even when sessionStorage.removeItem fails', () => {
  const mock = installThrowingStorageWindow()
  assert.equal(consumeAuthReturnTarget(), '#/')
  mock.restore()
})

test('navigateToAuth still sets AUTH_ROUTE when sessionStorage is unavailable', () => {
  const mock = installThrowingStorageWindow()
  navigateToAuth('#/archive')
  assert.equal(window.location.hash, AUTH_ROUTE)
  mock.restore()
})
