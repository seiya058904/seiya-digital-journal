import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { RefObject } from 'react'

import GradientText from '../effects/text/GradientText'
import ShinyText from '../effects/text/ShinyText'

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
        <ShinyText text="Personal Space" speed={2} spread={120} color="var(--color-gold)" shineColor="#e0e8ff" />
      </motion.p>
      <motion.p
        className="profile-hero__subtitle"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: easeOut, delay: reduceMotion ? 0 : 0.11 }}
      >
        <ShinyText text="Your quiet corner of the journal." speed={2} spread={120} color="var(--color-muted)" shineColor="#e0e8ff" />
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
        <GradientText
          colors={['#56e4ff', '#a78bfa', '#f472b6', '#fbbf24', '#56e4ff']}
          animationSpeed={15}
          direction="horizontal"
        >
          {displayName}
        </GradientText>
      </motion.h1>

      <motion.p
        className="profile-hero__email"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut, delay: reduceMotion ? 0 : 0.28 }}
      >
        <ShinyText text={email} speed={2} spread={120} color="var(--color-muted)" shineColor="#e0e8ff" />
      </motion.p>

      <motion.div
        className="profile-hero__meta"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: easeOut, delay: reduceMotion ? 0 : 0.32 }}
      >
        <span><ShinyText text={`Member since ${memberSinceLabel}`} speed={2} spread={120} color="var(--color-faint)" shineColor="#e0e8ff" /></span>
        <span className="profile-hero__status">
          <i aria-hidden="true" />
          <ShinyText text="Active" speed={2} spread={120} color="var(--color-faint)" shineColor="#e0e8ff" />
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
