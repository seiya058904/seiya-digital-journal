import { lazy, Suspense, useEffect, useState } from 'react'

import type { Page } from '../../appRoute'
import type { BackgroundMode } from '../../backgroundMode'
import { ArchiveBackground } from './ArchiveBackground'
import { AuroraBackground } from './AuroraBackground'
import { DesktopGridScan } from './react-bits/DesktopGridScan'
import { PhoneOnly } from '../ui/DesktopOnly'

const Beams = lazy(() => import('./react-bits/Beams'))
const SlicedWaves = lazy(() => import('./react-bits/SlicedWaves'))

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

function DesktopSlicedWaves() {
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
      <SlicedWaves
        color1="#FF9FFC"
        color2="#5227FF"
        color3="#B497CF"
        columns={14}
        rows={8}
        barThickness={0.1}
        speed={0.35}
        travel={0.7}
        waveSpread={0.9}
        rowOffset={1.0}
        softness={0.05}
        glow={0}
        brightness={1.0}
        contrast={1.0}
        opacity={0.5}
        orientation="horizontal"
        alternate={false}
        mouseInteraction
        mouseStrength={1}
        mouseRadius={0.3}
        grain
        grainIntensity={0.05}
      />
    </Suspense>
  ) : <div className="site-background__static" />
}

export function SiteBackground({ page, mode }: SiteBackgroundProps) {
  const showArchiveBackground = page.startsWith('archive') || page === 'gallery'

  return (
    <div className="site-background" aria-hidden="true">
      {mode === 'beams' ? (
        <DesktopBeams />
      ) : mode === 'sliced-waves' ? (
        <DesktopSlicedWaves />
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
