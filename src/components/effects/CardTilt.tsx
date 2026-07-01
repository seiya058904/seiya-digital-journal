import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { MouseEvent, PropsWithChildren } from 'react'

import { calculateTilt } from './tilt'

type CardTiltProps = PropsWithChildren<{
  className?: string
  intensity?: number
}>

export function CardTilt({ children, className, intensity = 5 }: CardTiltProps) {
  const reducedMotion = useReducedMotion()
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 24 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 24 })

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const tilt = calculateTilt(
      event.clientX - bounds.left,
      event.clientY - bounds.top,
      bounds.width,
      bounds.height,
      intensity,
    )
    rotateX.set(tilt.rotateX)
    rotateY.set(tilt.rotateY)
  }

  function reset() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
    >
      {children}
    </motion.div>
  )
}
