export type BackgroundMode = 'default' | 'beams' | 'sliced-waves'

export function toggleBackgroundMode(mode: BackgroundMode): BackgroundMode {
  if (mode === 'default') return 'beams'
  if (mode === 'beams') return 'sliced-waves'
  return 'default'
}
