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
            lineThickness={1}
            linesColor="#25315f"
            scanColor="#a78bfa"
            scanOpacity={0.5}
            gridScale={0.1}
            lineJitter={0.08}
            bloomIntensity={0.55}
            scanGlow={0.75}
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
