import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { SiteBackground } from './components/effects/SiteBackground'
import { Header } from './components/ui/Header'
import { toggleBackgroundMode, type BackgroundMode } from './backgroundMode'
import { HomePage } from './pages/HomePage'
import { ArchivePage } from './pages/ArchivePage'
import { ArchiveImagesPage } from './pages/ArchiveImagesPage'
import { ArchiveNoteDetailPage } from './pages/ArchiveNoteDetailPage'
import { ArchiveNotesPage } from './pages/ArchiveNotesPage'
import { ArchiveProjectsPage } from './pages/ArchiveProjectsPage'
import { ArchiveNotesCategoryPage } from './pages/ArchiveNotesCategoryPage'
import { GalleryPage } from './pages/GalleryPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { normalizeHashRoute, resolvePageFromHash, type Page } from './appRoute'

const MotionLabPage = lazy(() => import('./pages/MotionLabPage').then(m => ({ default: m.MotionLabPage })))

function getPageFromHash(): Page {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash
  // Redirect legacy collections route
  if (normalizeHashRoute(hash) === '#/archive/collections') {
    window.location.hash = '#/archive/images'
  }
  // Redirect the legacy standalone gallery route into the Archive namespace
  if (normalizeHashRoute(hash) === '#/gallery') {
    window.location.hash = '#/archive/images/gallery'
  }
  return resolvePageFromHash(hash)
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('default')
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

  const handleBackgroundToggle = () => {
    if (page.startsWith('archive') || page === 'gallery') return
    setBackgroundMode(toggleBackgroundMode)
  }

  return (
    <MotionConfig reducedMotion="user">
      <SiteBackground page={page} mode={backgroundMode} />
      <div className="site-main">
        <Header activePage={page} onBackgroundToggle={handleBackgroundToggle} />
        {page === 'lab' && <Suspense fallback={null}><MotionLabPage /></Suspense>}
        {page === 'archive' && <ArchivePage />}
        {page === 'archive-images' && <ArchiveImagesPage />}
        {page === 'archive-notes' && <ArchiveNotesPage />}
        {page === 'archive-note-detail' && <ArchiveNoteDetailPage />}
        {page === 'archive-notes-category' && <ArchiveNotesCategoryPage />}
        {page === 'archive-projects' && <ArchiveProjectsPage />}
        {page === 'gallery' && <GalleryPage />}
        {page === 'auth' && <AuthPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'home' && <HomePage />}
      </div>
    </MotionConfig>
  )
}
