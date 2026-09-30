import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('real React JournalStepperDemo and Stepper submission lifecycle', () => {
  const result = spawnSync(process.execPath, ['--import', './tests/helpers/stepper-loader.mjs', './tests/helpers/stepper-integration.mjs'], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})
