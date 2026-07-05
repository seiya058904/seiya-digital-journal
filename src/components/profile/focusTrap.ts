export function getWrappedFocusTarget({
  activeIndex,
  focusableCount,
  shiftKey,
}: {
  activeIndex: number
  focusableCount: number
  shiftKey: boolean
}): number | null {
  if (focusableCount < 1) return null
  if (shiftKey && activeIndex <= 0) return focusableCount - 1
  if (!shiftKey && activeIndex >= focusableCount - 1) return 0
  return null
}
