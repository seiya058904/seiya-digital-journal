import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { MouseEvent, PropsWithChildren, ReactNode } from 'react'

type TiltedCardProps = PropsWithChildren<{
  imageSrc?: string
  altText?: string
  caption?: ReactNode
  className?: string
  rotateAmplitude?: number
  scaleOnHover?: number
  disabled?: boolean
}>

export function TiltedCard({
  children,
  imageSrc,
  altText = '',
  caption,
  className = '',
  rotateAmplitude = 6,
  scaleOnHover = 1.05,
  disabled = false,
}: TiltedCardProps) {
  const reducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [rotateAmplitude, -rotateAmplitude]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-rotateAmplitude, rotateAmplitude]), {
    stiffness: 200,
    damping: 20,
  })

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotion || disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    x.set(px)
    y.set(py)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const noTilt = reducedMotion || disabled

  return (
    <motion.div
      className={`tilted-card ${className}`}
      onMouseMove={noTilt ? undefined : handleMouseMove}
      onMouseLeave={noTilt ? undefined : handleMouseLeave}
      whileHover={noTilt ? undefined : { scale: scaleOnHover }}
      style={noTilt ? undefined : { rotateX, rotateY, perspective: 800 }}
    >
      {imageSrc && (
        <div className="tilted-card__image-wrap">
          <img
            className="tilted-card__image"
            src={imageSrc}
            alt={altText}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      {caption && <div className="tilted-card__caption">{caption}</div>}
      {children}
    </motion.div>
  )
}
