export async function runFinalStepCompletion(
  onFinalStepCompleted: () => void | boolean | Promise<void | boolean>,
): Promise<boolean> {
  try {
    const result = await onFinalStepCompleted()
    return result !== false
  } catch {
    return false
  }
}
