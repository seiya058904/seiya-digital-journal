import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { CSSProperties, MouseEvent } from 'react'

import './ProfileCard.css'

type ProfileCardProps = {
  avatarUrl?: string
  name: string
  title?: string
  handle?: string
  status?: string
  className?: string
  enableTilt?: boolean
  behindGlowEnabled?: boolean
}

export function ProfileCard({
  avatarUrl,
  name,
  title,
  handle,
  status,
  className = '',
  enableTilt = true,
  behindGlowEnabled = true,
}: ProfileCardProps) {
  const reducedMotion = useReducedMotion()
  const tiltEnabled = enableTilt && !reducedMotion

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 150, damping: 20 }
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [8, -8]),
    springConfig,
  )
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-8, 8]),
    springConfig,
  )

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set((event.clientX - rect.left) / rect.width)
    mouseY.set((event.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      className={`pc-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        tiltEnabled
          ? ({ rotateX, rotateY, transformPerspective: 800 } as CSSProperties)
          : undefined
      }
    >
      {behindGlowEnabled && (
        <div className="pc-behind-glow" aria-hidden="true" />
      )}

      <div className="pc-card">
        <div className="pc-shine" aria-hidden="true" />

        {avatarUrl && (
          <div className="pc-avatar-wrap">
            <img
              className="pc-avatar"
              src={avatarUrl}
              alt={`${name} avatar`}
              loading="lazy"
              decoding="async"
              width={96}
              height={96}
            />
          </div>
        )}

        <div className="pc-info">
          <h3 className="pc-name">{name}</h3>
          {title && <p className="pc-title">{title}</p>}
          {handle && <span className="pc-handle">{handle}</span>}
          {status && (
            <div className="pc-status">
              <span className="pc-status-dot" aria-hidden="true" />
              <span>{status}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
