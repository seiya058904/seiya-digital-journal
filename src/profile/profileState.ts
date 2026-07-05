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
