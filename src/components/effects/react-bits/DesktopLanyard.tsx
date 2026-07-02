import { lazy, Suspense, useEffect, useState } from 'react'
import type { LanyardProps } from './Lanyard'

const Lanyard = lazy(() =>
  import('./Lanyard').then((module) => ({ default: module.default })),
)

const desktopQuery =
  '(min-width: 1080px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

type DesktopLanyardProps = Partial<LanyardProps> & {
  fallback?: React.ReactNode
}

export function DesktopLanyard({ fallback = null, ...props }: DesktopLanyardProps) {
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
      <Lanyard position={[0, 0, 13.5]} fov={20} transparent {...props} />
    </Suspense>
  )
}
