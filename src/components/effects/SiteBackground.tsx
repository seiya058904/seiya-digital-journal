import { lazy, Suspense, useEffect, useState } from 'react'

import type { Page } from '../../appRoute'
import type { BackgroundMode } from '../../backgroundMode'
import { ArchiveBackground } from './ArchiveBackground'
import { AuroraBackground } from './AuroraBackground'
import { DesktopGridScan } from './react-bits/DesktopGridScan'
import { PhoneOnly } from '../ui/DesktopOnly'

const Beams = lazy(() => import('./react-bits/Beams'))

type SiteBackgroundProps = {
  page: Page
  mode: BackgroundMode
}

function DesktopBeams() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const update = () => setEnabled(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return enabled ? (
    <Suspense fallback={null}>
      <Beams beamWidth={3} beamHeight={30} beamNumber={20} rotation={30} />
    </Suspense>
  ) : <div className="site-background__static" />
}

export function SiteBackground({ page, mode }: SiteBackgroundProps) {
  const showArchiveBackground = page.startsWith('archive') || page === 'gallery'

  return (
    <div className="site-background" aria-hidden="true">
      {mode === 'beams' ? (
        <DesktopBeams />
      ) : showArchiveBackground ? (
        <PhoneOnly><AuroraBackground /></PhoneOnly>
      ) : (
        <AuroraBackground />
      )}
      {mode === 'default' && page === 'home' ? (
        <DesktopGridScan
          className="site-gridscan"
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#2F293A"
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          scanDirection="pingpong"
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          scanGlow={0.5}
          scanSoftness={2}
          scanPhaseTaper={0.9}
          scanDuration={2.0}
          scanDelay={2.0}
          scanOnClick
          snapBackDelay={250}
        />
      ) : null}
      <ArchiveBackground hidden={!showArchiveBackground} />
    </div>
  )
}
