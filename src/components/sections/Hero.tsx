import { ArrowDown, Images } from 'lucide-react'
import { motion } from 'framer-motion'

import avatarSeiya from '../../assets/avatar-seiya.webp'
import { profile } from '../../data/profile'
import { ProfileCard } from '../effects/react-bits/ProfileCard'
import { GradientText } from '../effects/text/GradientText'
import { RotatingText } from '../effects/text/RotatingText'
import { TextReveal } from '../motion/TextReveal'
import { ActionLink } from '../ui/ActionLink'
import { DesktopOnly } from '../ui/DesktopOnly'

const identityWords = ['Learning', 'Creating', 'Remembering', 'Becoming']

export function Hero() {
  return (
    <section id="home" className="hero section">
      <div className="hero__copy">
        <h1>
          <TextReveal delay={0.08} className="hero__title-line">
            <GradientText
              colors={['#f3f6ff', '#56e4ff', '#a78bfa', '#f0abfc', '#f3f6ff']}
              animationSpeed={7}
              direction="right"
            >
              {profile.hero.title[0].text}{profile.hero.title[0].accent}
            </GradientText>
          </TextReveal>
          <TextReveal delay={0.17} className="hero__title-line">
            <GradientText
              colors={['#f3f6ff', '#56e4ff', '#a78bfa', '#f0abfc', '#f3f6ff']}
              animationSpeed={7}
              direction="right"
            >
              {profile.hero.title[1].text}{profile.hero.title[1].accent}
            </GradientText>
          </TextReveal>
        </h1>
        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {profile.hero.subtitle}
        </motion.p>
        <motion.p
          className="hero__chinese"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.48 }}
        >
          {profile.hero.chinese}
        </motion.p>
        <motion.p
          className="hero__identity-words"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.58 }}
        >
          <RotatingText
            texts={identityWords}
            rotationInterval={3000}
            staggerDuration={0.04}
            staggerFrom="first"
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            mainClassName="hero__rotating"
            splitBy="character"
          />
        </motion.p>
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          <ActionLink href="#about">View profile</ActionLink>
          <ActionLink href="#gallery" className="action-link--quiet">
            <Images aria-hidden="true" size={17} strokeWidth={1.7} />
            Explore gallery
          </ActionLink>
        </motion.div>
      </div>

      <DesktopOnly>
        <motion.div
          className="hero__portrait-wrap"
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProfileCard
            avatarUrl={avatarSeiya}
            name={profile.brand}
            title="Personal Journal"
            showUserInfo={false}
            enableTilt={true}
            behindGlowEnabled={false}
            className="hero-profile-card"
          />
        </motion.div>
      </DesktopOnly>

      <motion.a
        className="scroll-cue"
        href="#about"
        aria-label="Scroll to About"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
      >
        <ArrowDown aria-hidden="true" size={18} />
      </motion.a>
    </section>
  )
}
