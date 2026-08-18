import assert from 'node:assert/strict'
import test from 'node:test'

import { authModalReducer, initialAuthModalState } from './authModal.ts'

test('auth modal opens and closes without carrying route state', () => {
  const open = authModalReducer(initialAuthModalState, { type: 'open' })
  assert.deepEqual(open, { isOpen: true })
  assert.deepEqual(authModalReducer(open, { type: 'close' }), initialAuthModalState)
})
