import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import { ActivityStats } from '../components/profile/ActivityStats'
import { EditProfileSurface } from '../components/profile/EditProfileSurface'
import { ProfileHero } from '../components/profile/ProfileHero'
import { getProfileAvatar } from '../data/profileAvatars'
import { getCurrentInternalRoute, navigateToAuth, shouldRedirectProfileToAuth } from '../lib/authRoutes'
import { useProfile } from '../profile/ProfileContext'
import './ProfilePage.css'

const easeOut = [0.22, 1, 0.36, 1] as const

export function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const {
    profile,
    stats,
    loading,
    error,
    refresh,
    updateProfile,
  } = useProfile()
  const reduceMotion = useReducedMotion() ?? false

  const [editOpen, setEditOpen] = useState(false)
  const [saveTone, setSaveTone] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const editTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!shouldRedirectProfileToAuth({
      loading: authLoading,
      isAuthenticated,
      currentRoute: getCurrentInternalRoute(),
    })) {
      return
    }

    navigateToAuth('#/profile')
  }, [authLoading, isAuthenticated])

  const memberSinceLabel = useMemo(() => {
    if (!profile?.memberSince) return 'Recently'
    const date = new Date(profile.memberSince)
    if (Number.isNaN(date.getTime())) return 'Recently'
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }, [profile?.memberSince])

  const avatar = getProfileAvatar(profile?.avatarKey ?? '')

  const closeEditor = () => {
    setEditOpen(false)
    setSaveTone('idle')
    setSaveError(null)
    requestAnimationFrame(() => {
      editTriggerRef.current?.focus()
    })
  }

  const handleSubmit = async (input: { displayName: string, avatarKey: string }) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setSaveTone('saving')
    setSaveError(null)

    const result = await updateProfile(input)
    if (!result.ok) {
      setSaveTone('idle')
      setSaveError(result.message)
      return
    }

    setSaveTone('saved')
    if (reduceMotion) {
      closeEditor()
      return
    }

    closeTimerRef.current = window.setTimeout(() => {
      closeEditor()
      closeTimerRef.current = null
    }, 650)
  }

  if (authLoading || (!isAuthenticated && !loading)) {
    return <ProfileLoading />
  }

  if (error) {
    return (
      <main className="profile-page">
        <section className="profile-empty-state">
          <p className="profile-kicker">Personal Space</p>
          <h1>Unable to load your profile.</h1>
          <p>{error}</p>
          <button type="button" onClick={() => void refresh()}>Retry</button>
        </section>
      </main>
    )
  }

  if (loading || !profile || !stats) {
    return <ProfileLoading />
  }

  return (
    <motion.main
      className="profile-page"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut }}
    >
      <div className="profile-page__ambient" aria-hidden="true" />
      <div className="profile-page__inner">
        <ProfileHero
          avatarSrc={avatar.src}
          displayName={profile.displayName}
          email={profile.email}
          memberSinceLabel={memberSinceLabel}
          editButtonRef={editTriggerRef}
          onEdit={() => {
            setSaveTone('idle')
            setSaveError(null)
            setEditOpen(true)
          }}
        />
        <ActivityStats comments={stats.comments} likes={stats.likes} />
      </div>

      <EditProfileSurface
        open={editOpen}
        displayName={profile.displayName}
        avatarKey={profile.avatarKey}
        saveTone={saveTone}
        error={saveError}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />
    </motion.main>
  )
}

function ProfileLoading() {
  return (
    <main className="profile-page">
      <section className="profile-loading" aria-label="Loading profile">
        <div className="profile-loading__avatar" />
        <div className="profile-loading__line profile-loading__line--name" />
        <div className="profile-loading__line profile-loading__line--email" />
        <div className="profile-loading__line profile-loading__line--meta" />
        <div className="profile-loading__stats">
          <div />
          <div />
        </div>
      </section>
    </main>
  )
}
