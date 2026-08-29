import type Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useRef, type PropsWithChildren } from 'react'

import { getSmoothScrollMode, type SmoothScrollTarget, type SmoothScrollOptions } from './smoothScroll'

type SmoothScrollApi = {
  scrollTo: (target: SmoothScrollTarget, options?: SmoothScrollOptions) => void
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)

const FINE_POINTER_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function scrollNative(target: SmoothScrollTarget, immediate: boolean, reducedMotion: boolean) {
  const behavior = immediate || reducedMotion ? 'auto' : 'smooth'

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior })
    return
  }

  const element = typeof target === 'string'
    ? document.querySelector<HTMLElement>(target)
    : target
  element?.scrollIntoView({ behavior })
}

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const lenisRef = useRef<Lenis | null>(null)
  const destroyLenisRef = useRef<(() => void) | null>(null)
  const modeRef = useRef<'lenis' | 'native'>('native')
  const reducedMotionRef = useRef(false)
  const syncTokenRef = useRef(0)

  useEffect(() => {
    const finePointer = window.matchMedia(FINE_POINTER_QUERY)
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY)
    let disposed = false

    function destroyLenis() {
      destroyLenisRef.current?.()
      destroyLenisRef.current = null
      lenisRef.current = null
    }

    async function syncMode() {
      reducedMotionRef.current = reducedMotion.matches
      const mode = getSmoothScrollMode({
        finePointer: finePointer.matches,
        reducedMotion: reducedMotion.matches,
      })
      modeRef.current = mode
      destroyLenis()

      if (mode !== 'lenis' || disposed) return

      // Token guards against races: media queries can flip while the imports
      // are in flight, and an older sync must never instantiate Lenis.
      const token = ++syncTokenRef.current

      try {
        const [lenisModule, scrollTriggerModule] = await Promise.all([
          import('lenis'),
          import('gsap/ScrollTrigger'),
          import('lenis/dist/lenis.css'),
        ])
        if (disposed || token !== syncTokenRef.current) return

        const LenisConstructor = lenisModule.default
        const { ScrollTrigger: ScrollTriggerModule } = scrollTriggerModule
        const lenis = new LenisConstructor({
          autoRaf: true,
          smoothWheel: true,
          syncTouch: false,
          anchors: false,
          prevent: node => node.hasAttribute('data-lenis-prevent'),
        })
        const onScroll = () => ScrollTriggerModule.update()
        lenis.on('scroll', onScroll)
        lenisRef.current = lenis
        destroyLenisRef.current = () => {
          lenis.off('scroll', onScroll)
          lenis.destroy()
        }
      } catch {
        // Dynamic import failed (e.g. offline chunk fetch): native scrolling
        // keeps working because modeRef only gates on the live instance.
        modeRef.current = 'native'
      }
    }

    void syncMode()
    finePointer.addEventListener('change', syncMode)
    reducedMotion.addEventListener('change', syncMode)

    return () => {
      disposed = true
      syncTokenRef.current += 1
      finePointer.removeEventListener('change', syncMode)
      reducedMotion.removeEventListener('change', syncMode)
      destroyLenis()
    }
  }, [])

  const scrollTo = useCallback((target: SmoothScrollTarget, options: SmoothScrollOptions = {}) => {
    const immediate = options.immediate ?? false
    const lenis = lenisRef.current
    if (modeRef.current === 'lenis' && lenis) {
      lenis.scrollTo(target, { immediate, offset: options.offset })
      return
    }
    scrollNative(target, immediate, reducedMotionRef.current)
  }, [])

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext)
  if (!context) throw new Error('useSmoothScroll must be used within SmoothScrollProvider')
  return context
}
