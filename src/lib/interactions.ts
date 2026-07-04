export const ARCHIVE_STEPPER_TARGET = {
  targetType: 'archive',
  targetId: 'archive-stepper',
} as const

type ValidResult<T> = {
  ok: true
  value: T
}

type InvalidResult<TCode extends string> = {
  ok: false
  code: TCode
}

type CommentBodyValidationResult = ValidResult<string> | InvalidResult<'INVALID_COMMENT_BODY'>
type TargetValidationResult = ValidResult<typeof ARCHIVE_STEPPER_TARGET> | InvalidResult<'INVALID_TARGET'>

export function validateCommentBody(input: string): CommentBodyValidationResult {
  const value = input.trim()
  if (value.length < 1 || value.length > 500) {
    return { ok: false, code: 'INVALID_COMMENT_BODY' }
  }
  return { ok: true, value }
}

export function validateInteractionTarget(targetType: string, targetId: string): TargetValidationResult {
  if (
    targetType.trim() !== ARCHIVE_STEPPER_TARGET.targetType ||
    targetId.trim() !== ARCHIVE_STEPPER_TARGET.targetId
  ) {
    return { ok: false, code: 'INVALID_TARGET' }
  }

  return {
    ok: true,
    value: ARCHIVE_STEPPER_TARGET,
  }
}

type ApiErrorShape = {
  ok?: boolean
  error?: {
    code?: unknown
    message?: unknown
  }
} | null | undefined

export function normalizeApiError(error: ApiErrorShape): { code: string, message: string } {
  if (
    error?.error &&
    typeof error.error.code === 'string' &&
    typeof error.error.message === 'string'
  ) {
    return {
      code: error.error.code,
      message: error.error.message,
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong. Please try again.',
  }
}
