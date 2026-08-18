export type BackgroundMode = 'default' | 'beams'

export function toggleBackgroundMode(mode: BackgroundMode): BackgroundMode {
  return mode === 'default' ? 'beams' : 'default'
}
