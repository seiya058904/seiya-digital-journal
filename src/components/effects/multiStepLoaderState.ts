export function getNextLoaderState(
  currentState: number,
  totalStates: number,
  loop: boolean,
) {
  if (currentState < totalStates - 1) return currentState + 1
  return loop ? 0 : null
}
