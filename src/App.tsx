import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'

import { AuroraBackground } from './components/effects/AuroraBackground'

import { DesktopGridScan } from './components/effects/react-bits/DesktopGridScan'
import { Header } from './components/ui/Header'
import { HomePage } from './pages/HomePage'

const MotionLabPage = lazy(() => import('./pages/MotionLabPage').then(m => ({ default: m.MotionLabPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })))
const ArchiveImagesPage = lazy(() => import('./pages/ArchiveImagesPage').then(m => ({ default: m.ArchiveImagesPage })))
const ArchiveNotesPage = lazy(() => import('./pages/ArchiveNotesPage').then(m => ({ default: m.ArchiveNotesPage })))
const ArchiveCollectionsPage = lazy(() => import('./pages/ArchiveCollectionsPage').then(m => ({ default: m.ArchiveCollectionsPage })))
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })))

type Page = 'home' | 'lab' | 'archive' | 'archive-images' | 'archive-notes' | 'archive-collections' | 'gallery'

function getPageFromHash(): Page {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash
  if (hash === '#/lab' || hash === '#/motion-lab') return 'lab'
  if (hash === '#/archive/images') return 'archive-images'
  if (hash === '#/archive/notes') return 'archive-notes'
  if (hash === '#/archive/collections') return 'archive-collections'
  if (hash === '#/archive') return 'archive'
  if (hash === '#/gallery') return 'gallery'
  return 'home'
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
      <div className="site-main">
        <Header activePage={page} />
        {page === 'lab' && <Suspense fallback={null}><MotionLabPage /></Suspense>}
        {page === 'archive' && <Suspense fallback={null}><ArchivePage /></Suspense>}
        {page === 'archive-images' && <Suspense fallback={null}><ArchiveImagesPage /></Suspense>}
        {page === 'archive-notes' && <Suspense fallback={null}><ArchiveNotesPage /></Suspense>}
        {page === 'archive-collections' && <Suspense fallback={null}><ArchiveCollectionsPage /></Suspense>}
        {page === 'gallery' && <Suspense fallback={null}><GalleryPage /></Suspense>}
        {page === 'home' && <HomePage />}
      </div>
    </MotionConfig>
  )
}
