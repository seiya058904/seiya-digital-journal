import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { SiteBackground } from './components/effects/SiteBackground'
import { AuthModal } from './components/auth/AuthModal'
import { Header } from './components/ui/Header'
import { useAuth } from './auth/AuthContext'
import { useAuthModal } from './auth/useAuthModal'
import { readBackgroundMode, saveBackgroundMode, toggleBackgroundMode, type BackgroundMode } from './backgroundMode'
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
import { useSmoothScroll } from './scroll/SmoothScrollProvider'

const MotionLabPage = lazy(() => import('./pages/MotionLabPage').then(m => ({ default: m.MotionLabPage })))

function getStoredBackgroundMode(): BackgroundMode {
  try {
    return typeof window === 'undefined' ? 'default' : readBackgroundMode(window.localStorage)
  } catch {
    return 'default'
  }
}

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
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>(getStoredBackgroundMode)
  const prevPage = useRef(page)
  const { clearPasswordRecovery, isPasswordRecovery } = useAuth()
  const { closeAuthModal, isOpen: isAuthModalOpen } = useAuthModal()
  const { scrollTo } = useSmoothScroll()

  const handleAuthModalClose = () => {
    clearPasswordRecovery()
    closeAuthModal()
  }

  useEffect(() => {
    function onHashChange() {
      const p = getPageFromHash()
      const prev = prevPage.current
      prevPage.current = p
      closeAuthModal()
      clearPasswordRecovery()
      setPage(p)
      // Scroll to top on page switch — sub-routes that return the same page name (e.g.
      // #/archive/images and #/archive/images/featured both → 'archive-images') skip.
      if (p !== prev && p !== 'home') scrollTo(0, { immediate: true })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [clearPasswordRecovery, closeAuthModal, scrollTo])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') saveBackgroundMode(window.localStorage, backgroundMode)
    } catch {
      // localStorage unavailable — keep the preference in memory
    }
  }, [backgroundMode])

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
      <AuthModal
        open={isAuthModalOpen || (isPasswordRecovery && page !== 'auth')}
        onClose={handleAuthModalClose}
      />
    </MotionConfig>
  )
}
