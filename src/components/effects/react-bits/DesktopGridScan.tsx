import { lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { GridScanProps } from './GridScan'

const GridScan = lazy(() =>
  import('./GridScan').then((module) => ({ default: module.GridScan })),
)

const desktopQuery =
  '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

type DesktopGridScanProps = GridScanProps & {
  fallback?: ReactNode
}

export function DesktopGridScan({ fallback = null, ...props }: DesktopGridScanProps) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(desktopQuery)
    const update = () => setEnabled(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  if (!enabled) return fallback

  return (
    <Suspense fallback={fallback}>
      <GridScan {...props} />
    </Suspense>
  )
}
