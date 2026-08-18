export type BackgroundMode = 'default' | 'beams' | 'sliced-waves'

export const BACKGROUND_MODE_STORAGE_KEY = 'seiya-background-mode'

type BackgroundModeStorage = Pick<Storage, 'getItem' | 'setItem'>

function isBackgroundMode(value: string | null): value is BackgroundMode {
  return value === 'default' || value === 'beams' || value === 'sliced-waves'
}

export function readBackgroundMode(storage: BackgroundModeStorage | null | undefined): BackgroundMode {
  try {
    const value = storage?.getItem(BACKGROUND_MODE_STORAGE_KEY) ?? null
    return isBackgroundMode(value) ? value : 'default'
  } catch {
    return 'default'
  }
}

export function saveBackgroundMode(
  storage: BackgroundModeStorage | null | undefined,
  mode: BackgroundMode,
) {
  try {
    storage?.setItem(BACKGROUND_MODE_STORAGE_KEY, mode)
  } catch {
    // storage unavailable — keep the preference in memory
  }
}

export function toggleBackgroundMode(mode: BackgroundMode): BackgroundMode {
  if (mode === 'default') return 'beams'
  if (mode === 'beams') return 'sliced-waves'
  return 'default'
}
