import { useMotionValue, useAnimationFrame, useTransform, useReducedMotion, motion } from 'framer-motion'
import { useState, useRef, useCallback, type PropsWithChildren } from 'react'

import './GradientText.css'

type Direction = 'left' | 'right' | 'top' | 'bottom' | 'diagonal'

type GradientTextProps = PropsWithChildren<{
  className?: string
  colors?: string[]
  animationSpeed?: number
  showBorder?: boolean
  direction?: Direction
  pauseOnHover?: boolean
  yoyo?: boolean
}>

const DEFAULT_COLORS = [
  'var(--color-cyan)',
  'var(--color-violet)',
  'var(--color-magenta)',
  'var(--color-gold)',
  'var(--color-cyan)',
]

function getAngle(direction: Direction): number {
  switch (direction) {
    case 'right': return 90
    case 'left': return 270
    case 'top': return 0
    case 'bottom': return 180
    case 'diagonal': return 135
  }
}

function getPositions(direction: Direction, progress: number) {
  if (direction === 'top' || direction === 'bottom') {
    const from = -100 + progress
    const to = 100 + progress
    return { from: `50% ${from}%`, to: `50% ${to}%` }
  }
  const from = -100 + progress
  const to = 100 + progress
  return { from: `${from}% 50%`, to: `${to}% 50%` }
}

export function GradientText({
  children,
  className,
  colors = DEFAULT_COLORS,
  animationSpeed = 5,
  showBorder = false,
  direction = 'right',
  pauseOnHover = false,
  yoyo = false,
}: GradientTextProps) {
  const reducedMotion = useReducedMotion()
  const [hovering, setHovering] = useState(false)
  const currentDirRef = useRef(1)
  const progressRef = useRef(0)

  const motionProgress = useMotionValue(0)

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return
    if (pauseOnHover && hovering) return

    const speed = (animationSpeed * delta) / 1000
    let next = progressRef.current + speed * currentDirRef.current

    if (next >= 100) {
      if (yoyo) {
        next = 100
        currentDirRef.current = -1
      } else {
        next = next % 200
        if (next >= 100) next = next - 200
      }
    } else if (next <= 0) {
      if (yoyo) {
        next = 0
        currentDirRef.current = 1
      } else {
        next = next % 200
        if (next < 0) next = next + 200
      }
    }

    progressRef.current = next
    motionProgress.set(next)
  })

  const backgroundPosition = useTransform(motionProgress, (p) => {
    const pos = getPositions(direction, p)
    return pos.from
  })

  const gradientAngle = getAngle(direction)
  const gradient = `linear-gradient(${gradientAngle}deg, ${colors.join(', ')})`

  const handleEnter = useCallback(() => { if (pauseOnHover) setHovering(true) }, [pauseOnHover])
  const handleLeave = useCallback(() => { if (pauseOnHover) setHovering(false) }, [pauseOnHover])

  if (reducedMotion) {
    const flatClass = ['gradient-text', className].filter(Boolean).join(' ')
    return (
      <span className={flatClass} style={{ backgroundImage: gradient, backgroundPosition: '0% 50%' }}>
        {children}
      </span>
    )
  }

  const classes = [
    'gradient-text',
    'gradient-text--animated',
    showBorder ? 'gradient-text--border' : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <motion.span
      className={classes}
      style={{
        backgroundImage: gradient,
        backgroundPosition,
        backgroundSize: '300% 300%',
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.span>
  )
}
