import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('real API and like component recover from invalid response bodies', () => {
  const root = fileURLToPath(new URL('../../', import.meta.url))
  const result = spawnSync(process.execPath, [
    '--import', './tests/helpers/like-response-loader.mjs',
    '--test', './tests/helpers/like-response-integration.mjs',
  ], { cwd: root, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
