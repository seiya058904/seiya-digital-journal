export const COMMENT_SUCCESS_VISIBLE_MS = 1800
export const COMMENT_SUCCESS_FADE_MS = 220

export type CommentSuccessTimerApi<THandle = ReturnType<typeof setTimeout>> = {
  setTimeout: (callback: () => void, delay: number) => THandle
  clearTimeout: (handle: THandle) => void
}

export function scheduleCommentSuccessLifecycle<THandle>(
  timers: CommentSuccessTimerApi<THandle>,
  callbacks: {
    onFadeStart: () => void
    onReset: () => void
  },
) {
  const fadeTimeout = timers.setTimeout(() => {
    callbacks.onFadeStart()
  }, COMMENT_SUCCESS_VISIBLE_MS)

  const resetTimeout = timers.setTimeout(() => {
    callbacks.onReset()
  }, COMMENT_SUCCESS_VISIBLE_MS + COMMENT_SUCCESS_FADE_MS)

  return () => {
    timers.clearTimeout(fadeTimeout)
    timers.clearTimeout(resetTimeout)
  }
}
