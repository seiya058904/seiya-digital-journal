import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('auth view/operation ownership scenarios on the real AuthPage', () => {
  const result = spawnSync(process.execPath, ['--import', './tests/helpers/auth-page-loader.mjs', './tests/helpers/auth-page-integration.mjs'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
