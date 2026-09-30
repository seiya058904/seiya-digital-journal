import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('temporary SDK identity reaches the real application comment request', () => {
  const result = spawnSync(process.execPath, ['--import', './tests/helpers/auth-api-loader.mjs', './tests/helpers/auth-api-integration.mjs'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
