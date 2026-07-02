import { useMemo } from 'react'
import Silk from './react-bits/Silk'
import './ArchiveBackground.css'

export function ArchiveBackground({ hidden = false }: { hidden?: boolean }) {
  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  if (hidden || reducedMotion) return null

  return (
    <div className="archive-bg" aria-hidden="true">
      <Silk
        speed={4}
        scale={2}
        color="#524499"
        noiseIntensity={1.5}
        rotation={0.5}
      />
    </div>
  )
}
