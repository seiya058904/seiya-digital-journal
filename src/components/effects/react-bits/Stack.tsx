import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { useEffect, useState, type PropsWithChildren, type ReactNode } from 'react'

import './Stack.css'

type CardRotateProps = PropsWithChildren<{
  onSendToBack: () => void
  sensitivity: number
  disableDrag?: boolean
}>

function CardRotate({
  children,
  onSendToBack,
  sensitivity,
  disableDrag = false,
}: CardRotateProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [60, -60])
  const rotateY = useTransform(x, [-100, 100], [-60, 60])

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack()
    } else {
      x.set(0)
      y.set(0)
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="card-rotate-disabled" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  )
}

type StackProps = {
  cards: ReactNode[]
  randomRotation?: boolean
  sensitivity?: number
  animationConfig?: {
    stiffness: number
    damping: number
  }
  sendToBackOnClick?: boolean
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
  mobileClickOnly?: boolean
  mobileBreakpoint?: number
}

export function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards,
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 1024,
}: StackProps) {
  const reducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stack, setStack] = useState(() =>
    cards.map((content, index) => ({ id: index + 1, content })),
  )

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [mobileBreakpoint])

  useEffect(() => {
    setStack(cards.map((content, index) => ({ id: index + 1, content })))
  }, [cards])

  function sendToBack(id: number) {
    setStack((current) => {
      const next = [...current]
      const index = next.findIndex((card) => card.id === id)
      const [card] = next.splice(index, 1)
      next.unshift(card)
      return next
    })
  }

  useEffect(() => {
    if (!autoplay || stack.length <= 1 || isPaused || reducedMotion || isMobile) {
      return
    }

    const interval = window.setInterval(() => {
      setStack((current) => {
        const next = [...current]
        const [card] = next.splice(next.length - 1, 1)
        next.unshift(card)
        return next
      })
    }, autoplayDelay)

    return () => window.clearInterval(interval)
  }, [autoplay, autoplayDelay, isMobile, isPaused, reducedMotion, stack.length])

  const disableDrag = Boolean(reducedMotion) || isMobile
  const enableClick = !isMobile && (sendToBackOnClick || mobileClickOnly)

  return (
    <div
      className="stack-container"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation
          ? ((card.id * 7.3) % 10) - 5
          : 0
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={disableDrag}
          >
            <motion.div
              className="card"
              onClick={() => enableClick && sendToBack(card.id)}
              animate={{
                rotateZ:
                  (stack.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: '90% 90%',
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        )
      })}
    </div>
  )
}
