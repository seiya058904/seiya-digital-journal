import { MotionConfig } from 'framer-motion'
import { useEffect, useState } from 'react'

import { AuroraBackground } from './components/effects/AuroraBackground'
import { CursorGlow } from './components/effects/CursorGlow'
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
      <CursorGlow />
      <Header activePage={page} />
      {page === 'lab' ? <MotionLabPage /> : <HomePage />}
    </MotionConfig>
  )
}
