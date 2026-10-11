export function shouldApplyProfileMutation({
  mounted,
  activeUserId,
  capturedUserId,
  currentRequestId,
  capturedRequestId,
}: {
  mounted: boolean
  activeUserId: string | null
  capturedUserId: string | null
  currentRequestId: number
  capturedRequestId: number
}): boolean {
  return (
    mounted &&
    activeUserId !== null &&
    activeUserId === capturedUserId &&
    currentRequestId === capturedRequestId
  )
}

/**
 * Whether a completed profile read may apply its result. A read is owned by
 * the request that started it: it only applies while still mounted and not
 * superseded by a newer read or by a successful save (JR-02), which bumps the
 * read counter to invalidate reads that may hold a pre-save snapshot.
 */
export function shouldApplyProfileReadResult({
  mounted,
  currentReadRequestId,
  capturedReadRequestId,
}: {
  mounted: boolean
  currentReadRequestId: number
  capturedReadRequestId: number
}): boolean {
  return mounted && currentReadRequestId === capturedReadRequestId
}
