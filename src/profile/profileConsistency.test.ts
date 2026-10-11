import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('profile read/save ownership scenarios on the real provider', () => {
  const result = spawnSync(process.execPath, ['--import', './tests/helpers/profile-loader.mjs', './tests/helpers/profile-integration.mjs'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
