import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('like button read/like ownership scenarios on the real component', () => {
  const result = spawnSync(process.execPath, ['--import', './tests/helpers/like-loader.mjs', './tests/helpers/like-integration.mjs'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
