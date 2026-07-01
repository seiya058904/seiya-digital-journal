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
      <AuroraBackground />
      {page === 'home' ? (
        <DesktopGridScan
          className="site-gridscan"
          linesColor="#24466d"
          scanColor="#63e7ff"
          scanOpacity={0.46}
          gridScale={0.115}
          lineJitter={0.08}
          bloomIntensity={0.38}
        />
      ) : null}
      <CursorGlow />
      <Header activePage={page} />
      {page === 'lab' ? <MotionLabPage /> : <HomePage />}
    </MotionConfig>
  )
}
