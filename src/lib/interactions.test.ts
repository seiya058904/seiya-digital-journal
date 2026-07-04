import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ARCHIVE_STEPPER_TARGET,
  normalizeApiError,
  validateCommentBody,
  validateInteractionTarget,
} from './interactions.ts'

test('archive stepper target stays on a stable archive-wide identifier', () => {
  assert.deepEqual(ARCHIVE_STEPPER_TARGET, {
    targetType: 'archive',
    targetId: 'archive-stepper',
  })
})

test('comment body trims surrounding whitespace before acceptance', () => {
  assert.deepEqual(validateCommentBody('  hello archive  '), {
    ok: true,
    value: 'hello archive',
  })
})

test('comment body rejects empty content after trimming', () => {
  assert.deepEqual(validateCommentBody('   '), {
    ok: false,
    code: 'INVALID_COMMENT_BODY',
  })
})

test('comment body rejects text longer than 500 characters', () => {
  assert.deepEqual(validateCommentBody('a'.repeat(501)), {
    ok: false,
    code: 'INVALID_COMMENT_BODY',
  })
})

test('interaction target accepts the archive stepper identifier', () => {
  assert.deepEqual(
    validateInteractionTarget(ARCHIVE_STEPPER_TARGET.targetType, ARCHIVE_STEPPER_TARGET.targetId),
    {
      ok: true,
      value: ARCHIVE_STEPPER_TARGET,
    },
  )
})

test('interaction target rejects empty type and id', () => {
  assert.deepEqual(validateInteractionTarget('', ''), {
    ok: false,
    code: 'INVALID_TARGET',
  })
})

test('normalizeApiError keeps explicit api code and message', () => {
  assert.deepEqual(
    normalizeApiError({
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Please wait a moment before posting again.',
      },
    }),
    {
      code: 'RATE_LIMITED',
      message: 'Please wait a moment before posting again.',
    },
  )
})

test('normalizeApiError falls back to a safe default message', () => {
  assert.deepEqual(normalizeApiError(null), {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
  })
})
