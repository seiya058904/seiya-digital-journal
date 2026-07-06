import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
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

  const [silkPausedInternal, setSilkPausedInternal] = useState(hidden)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!hidden) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setSilkPausedInternal(false)
      return
    }
    const id = setTimeout(() => setSilkPausedInternal(true), FADE_MS)
    timerRef.current = id
    return () => clearTimeout(id)
  }, [hidden])

  // Keep Silk mounted on desktop even when hidden so WebGL context survives
  // navigation — prevents stutter on home↔archive transitions.
  // On mobile / reduced-motion: skip entirely.
  if (reducedMotion || isMobile) return null

  return (
    <div
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
          paused={hidden ? silkPausedInternal : false}
        />
      </Suspense>
    </div>
  )
}
