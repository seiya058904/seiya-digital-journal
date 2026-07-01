import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'

import { AuroraBackground } from './components/effects/AuroraBackground'
import { CursorGlow } from './components/effects/CursorGlow'
import { DesktopGridScan } from './components/effects/react-bits/DesktopGridScan'
import { Header } from './components/ui/Header'
import { HomePage } from './pages/HomePage'
import { MotionLabPage } from './pages/MotionLabPage'

type Page = 'home' | 'lab'

function getPageFromHash(): Page {
  if (typeof window === 'undefined') return 'home'
  return window.location.hash === '#/motion-lab' ? 'lab' : 'home'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)

  useEffect(() => {
    function onHashChange() {
      setPage(getPageFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-background" aria-hidden="true">
        <AuroraBackground />
        {page === 'home' ? (
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
      </div>
      <CursorGlow />
      <div className="site-main">
        <Header activePage={page} />
        {page === 'lab' ? <MotionLabPage /> : <HomePage />}
      </div>
    </MotionConfig>
  )
}
