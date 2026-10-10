import assert from 'node:assert/strict'
import test from 'node:test'

import { createAuthOperationGate } from './authOperationGate.ts'

test('an operation stays current until something newer begins or revokes', () => {
  const gate = createAuthOperationGate()
  const operation = gate.begin()
  assert.equal(gate.isCurrent(operation), true)
  gate.revokeAll()
  assert.equal(gate.isCurrent(operation), false)
})

test('a newer operation revokes the older one', () => {
  const gate = createAuthOperationGate()
  const first = gate.begin()
  const second = gate.begin()
  assert.equal(gate.isCurrent(first), false)
  assert.equal(gate.isCurrent(second), true)
})

test('A→B→A switching never restores ownership of the original operation', () => {
  const gate = createAuthOperationGate()
  const original = gate.begin()
  gate.revokeAll()
  gate.revokeAll()
  assert.equal(gate.isCurrent(original), false)
  const fresh = gate.begin()
  assert.equal(gate.isCurrent(fresh), true)
  assert.notEqual(fresh, original)
})
