import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { ArchiveBackground } from './components/effects/ArchiveBackground'
import { AuroraBackground } from './components/effects/AuroraBackground'

import { DesktopGridScan } from './components/effects/react-bits/DesktopGridScan'
import { Header } from './components/ui/Header'
import { HomePage } from './pages/HomePage'
import { ArchivePage } from './pages/ArchivePage'
import { ArchiveImagesPage } from './pages/ArchiveImagesPage'
import { ArchiveNotesPage } from './pages/ArchiveNotesPage'
import { ArchiveProjectsPage } from './pages/ArchiveProjectsPage'
import { ArchiveNotesCategoryPage } from './pages/ArchiveNotesCategoryPage'
import { GalleryPage } from './pages/GalleryPage'

const MotionLabPage = lazy(() => import('./pages/MotionLabPage').then(m => ({ default: m.MotionLabPage })))

type Page = 'home' | 'lab' | 'archive' | 'archive-images' | 'archive-notes' | 'archive-notes-category' | 'archive-projects' | 'gallery'

function getPageFromHash(): Page {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash
  if (hash === '#/lab' || hash === '#/motion-lab') return 'lab'
  // Image vault sub-routes all render the same page component
  if (hash === '#/archive/images' || hash.startsWith('#/archive/images/')) return 'archive-images'
  // Notes root — handle both with and without trailing slash
  if (hash === '#/archive/notes' || hash === '#/archive/notes/') return 'archive-notes'
  // Notes sub-routes (learning, thoughts, journal, etc.) all render ArchiveNotesCategoryPage
  if (hash.startsWith('#/archive/notes/')) return 'archive-notes-category'
  if (hash === '#/archive/projects') return 'archive-projects'
  // Redirect legacy collections route
  if (hash === '#/archive/collections') {
    window.location.hash = '#/archive/images'
    return 'archive-images'
  }
  if (hash === '#/archive') return 'archive'
  if (hash === '#/gallery') return 'gallery'
  return 'home'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const prevPage = useRef(page)

  useEffect(() => {
    function onHashChange() {
      const p = getPageFromHash()
      const prev = prevPage.current
      prevPage.current = p
      setPage(p)
      // Scroll to top on page switch — sub-routes that return the same page name (e.g.
      // #/archive/images and #/archive/images/featured both → 'archive-images') skip.
      if (p !== prev && p !== 'home') window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-background" aria-hidden="true">
        {!(page.startsWith('archive') || page === 'gallery') && <AuroraBackground />}
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
        <ArchiveBackground hidden={!page.startsWith('archive') && page !== 'gallery'} />
      </div>
      <div className="site-main">
        <Header activePage={page} />
        {page === 'lab' && <Suspense fallback={null}><MotionLabPage /></Suspense>}
        {page === 'archive' && <ArchivePage />}
        {page === 'archive-images' && <ArchiveImagesPage />}
        {page === 'archive-notes' && <ArchiveNotesPage />}
        {page === 'archive-notes-category' && <ArchiveNotesCategoryPage />}
        {page === 'archive-projects' && <ArchiveProjectsPage />}
        {page === 'gallery' && <GalleryPage />}
        {page === 'home' && <HomePage />}
      </div>
    </MotionConfig>
  )
}
