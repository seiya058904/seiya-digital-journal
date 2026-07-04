import assert from 'node:assert/strict'
import test from 'node:test'

import { runFinalStepCompletion } from './stepperState.ts'

test('runFinalStepCompletion treats explicit false as a blocked completion', async () => {
  await assert.doesNotReject(async () => {
    const result = await runFinalStepCompletion(async () => false)
    assert.equal(result, false)
  })
})

test('runFinalStepCompletion recovers from thrown completion handlers', async () => {
  await assert.doesNotReject(async () => {
    const result = await runFinalStepCompletion(async () => {
      throw new Error('unexpected failure')
    })
    assert.equal(result, false)
  })
})

test('runFinalStepCompletion accepts successful completions', async () => {
  await assert.doesNotReject(async () => {
    const result = await runFinalStepCompletion(async () => true)
    assert.equal(result, true)
  })
})
