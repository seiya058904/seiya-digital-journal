export type SmoothScrollMode = 'lenis' | 'native'

export type SmoothScrollTarget = number | string | HTMLElement

export type SmoothScrollOptions = {
  immediate?: boolean
  offset?: number
}

export type SmoothScrollEnvironment = {
  finePointer: boolean
  reducedMotion: boolean
}

export function getSmoothScrollMode({ finePointer, reducedMotion }: SmoothScrollEnvironment): SmoothScrollMode {
  return finePointer && !reducedMotion ? 'lenis' : 'native'
}
