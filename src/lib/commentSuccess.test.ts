import assert from 'node:assert/strict'
import test from 'node:test'

import {
  COMMENT_SUCCESS_FADE_MS,
  COMMENT_SUCCESS_VISIBLE_MS,
  scheduleCommentSuccessLifecycle,
} from './commentSuccess.ts'

test('comment success lifecycle schedules fade and reset in order', () => {
  const scheduled: Array<{ delay: number, callback: () => void }> = []
  const cleared: unknown[] = []
  let faded = false
  let reset = false

  scheduleCommentSuccessLifecycle(
    {
      setTimeout(callback, delay) {
        const handle = { delay, callback }
        scheduled.push(handle)
        return handle
      },
      clearTimeout(handle) {
        cleared.push(handle)
      },
    },
    {
      onFadeStart: () => {
        faded = true
      },
      onReset: () => {
        reset = true
      },
    },
  )

  assert.deepEqual(
    scheduled.map((item) => item.delay),
    [COMMENT_SUCCESS_VISIBLE_MS, COMMENT_SUCCESS_VISIBLE_MS + COMMENT_SUCCESS_FADE_MS],
  )

  scheduled[0].callback()
  assert.equal(faded, true)
  assert.equal(reset, false)

  scheduled[1].callback()
  assert.equal(reset, true)
  assert.equal(cleared.length, 0)
})

test('comment success lifecycle cleanup clears both pending timers', () => {
  const handles: unknown[] = []
  const cleared: unknown[] = []

  const cleanup = scheduleCommentSuccessLifecycle(
    {
      setTimeout(callback, delay) {
        const handle = { callback, delay }
        handles.push(handle)
        return handle
      },
      clearTimeout(handle) {
        cleared.push(handle)
      },
    },
    {
      onFadeStart: () => {},
      onReset: () => {},
    },
  )

  cleanup()
  assert.deepEqual(cleared, handles)
})
