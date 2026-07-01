import { useMotionValue, useAnimationFrame, useTransform, useReducedMotion, motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'

import './ShinyText.css'

type Direction = 'left' | 'right'

type ShinyTextProps = {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  yoyo?: boolean
  pauseOnHover?: boolean
  direction?: Direction
  delay?: number
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className,
  color = 'var(--color-muted)',
  shineColor = 'var(--color-text)',
  spread = 100,
  yoyo = false,
  pauseOnHover = false,
  direction = 'right',
  delay = 0,
}: ShinyTextProps) {
  const reducedMotion = useReducedMotion()
  const [hovering, setHovering] = useState(false)
  const [delayDone, setDelayDone] = useState(delay <= 0)
  const currentDirRef = useRef(direction === 'left' ? -1 : 1)
  const progressRef = useRef(direction === 'left' ? 100 : -100)

  const motionProgress = useMotionValue(direction === 'left' ? 100 : -100)

  // Handle initial delay
  if (!delayDone && delay > 0) {
    const start = performance.now()
    const check = () => {
      if (performance.now() - start >= delay * 1000) {
        setDelayDone(true)
        return
      }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  }

  useAnimationFrame((_, delta) => {
    if (reducedMotion || disabled || !delayDone) return
    if (pauseOnHover && hovering) return

    const step = (speed * delta) / 1000
    let next = progressRef.current + step * currentDirRef.current

    if (next >= 200) {
      if (yoyo) {
        next = 200
        currentDirRef.current = -1
      } else {
        next = -100
      }
    } else if (next <= -100) {
      if (yoyo) {
        next = -100
        currentDirRef.current = 1
      } else {
        next = 200
      }
    }

    progressRef.current = next
    motionProgress.set(next)
  })

  const backgroundPosition = useTransform(motionProgress, (p) => `${p}% 0`)

  const handleEnter = useCallback(() => { if (pauseOnHover) setHovering(true) }, [pauseOnHover])
  const handleLeave = useCallback(() => { if (pauseOnHover) setHovering(false) }, [pauseOnHover])

  const isAnimationDisabled = disabled || reducedMotion

  const shineGradient = `linear-gradient(90deg, transparent 0%, ${shineColor} 50%, transparent 100%)`

  const maskClasses = [
    'shiny-text__mask',
    isAnimationDisabled ? 'shiny-text__mask--disabled' : '',
    pauseOnHover && hovering ? 'shiny-text__mask--paused' : '',
  ].filter(Boolean).join(' ')

  return (
    <span
      className={`shiny-text ${className ?? ''}`}
      style={{
        color,
        ['--shine-spread' as string]: `${spread}%`,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {text}
      <motion.span
        className={maskClasses}
        style={{
          backgroundImage: shineGradient,
          backgroundPosition: isAnimationDisabled ? '50% 0' : backgroundPosition,
          backgroundSize: `${spread}% 100%`,
        }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
    </span>
  )
}
