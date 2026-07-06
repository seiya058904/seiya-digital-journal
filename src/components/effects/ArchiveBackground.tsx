import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './ArchiveBackground.css'

const Silk = lazy(() => import('./react-bits/Silk'))

const FADE_MS = 400

export function ArchiveBackground({ hidden = false }: { hidden?: boolean }) {
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true
    // Touch-only devices (phones, tablets) skip Silk entirely to save GPU/battery.
    // Desktops keep Silk pre-mounted for smooth background transitions.
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches
  }, [])

  const [fadeDone, setFadeDone] = useState(!hidden)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hidden) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setFadeDone(true)
      return
    }
    setFadeDone(false)
    const id = setTimeout(() => setFadeDone(true), FADE_MS)
    timerRef.current = id
    return () => clearTimeout(id)
  }, [hidden])

  const onTransitionEnd = useCallback(() => {
    if (hidden) setFadeDone(true)
  }, [hidden])

  useEffect(() => {
    const el = bgRef.current
    if (!el || !hidden) return
    el.addEventListener('transitionend', onTransitionEnd, { once: true })
    return () => el.removeEventListener('transitionend', onTransitionEnd)
  }, [hidden, onTransitionEnd])

  // Keep Silk mounted on desktop even when hidden so WebGL context survives
  // navigation — prevents stutter on home↔archive transitions.
  // On mobile / reduced-motion: skip entirely.
  if (reducedMotion || isMobile) return null

  return (
    <div
      ref={bgRef}
      className={`archive-bg${hidden ? ' archive-bg--hidden' : ''}`}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Silk
          speed={4}
          scale={2}
          color="#524499"
          noiseIntensity={1.5}
          rotation={0.5}
          paused={hidden && fadeDone}
        />
      </Suspense>
    </div>
  )
}
