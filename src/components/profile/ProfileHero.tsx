import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { RefObject } from 'react'

type ProfileHeroProps = {
  avatarSrc: string
  displayName: string
  email: string
  memberSinceLabel: string
  onEdit: () => void
  editButtonRef?: RefObject<HTMLButtonElement | null>
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function ProfileHero({
  avatarSrc,
  displayName,
  email,
  memberSinceLabel,
  onEdit,
  editButtonRef,
}: ProfileHeroProps) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="profile-hero">
      <motion.p
        className="profile-kicker"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: easeOut, delay: reduceMotion ? 0 : 0.06 }}
      >
        Personal Space
      </motion.p>
      <motion.p
        className="profile-hero__subtitle"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: easeOut, delay: reduceMotion ? 0 : 0.11 }}
      >
        Your quiet corner of the journal.
      </motion.p>

      <motion.div
        className="profile-avatar-stage"
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: easeOut, delay: reduceMotion ? 0 : 0.17 }}
      >
        <span className="profile-avatar-stage__glow" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={avatarSrc}
            src={avatarSrc}
            alt=""
            className="profile-avatar-stage__image"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: easeOut }}
          />
        </AnimatePresence>
      </motion.div>

      <motion.h1
        className="profile-hero__name"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.34, ease: easeOut, delay: reduceMotion ? 0 : 0.23 }}
      >
        {displayName}
      </motion.h1>

      <motion.p
        className="profile-hero__email"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut, delay: reduceMotion ? 0 : 0.28 }}
      >
        {email}
      </motion.p>

      <motion.div
        className="profile-hero__meta"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut, delay: reduceMotion ? 0 : 0.32 }}
      >
        <span>Member since {memberSinceLabel}</span>
        <span className="profile-hero__status">
          <i aria-hidden="true" />
          Active
        </span>
      </motion.div>

      <motion.button
        type="button"
        className="profile-edit-trigger"
        onClick={onEdit}
        ref={editButtonRef}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut, delay: reduceMotion ? 0 : 0.38 }}
      >
        Edit profile
      </motion.button>
    </section>
  )
}
