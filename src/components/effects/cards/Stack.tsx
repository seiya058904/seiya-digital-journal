import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import './Stack.css'

type StackProps = {
  cards: ReactNode[]
  className?: string
  sensitivity?: number
  sendToBackOnClick?: boolean
  randomRotation?: boolean
  disabled?: boolean
  mobileClickOnly?: boolean
}

type CardState = {
  id: number
  rotation: number
  offsetX: number
  offsetY: number
}

function getRandomOffset(seed: number) {
  // Deterministic-ish small random offset based on index
  const angle = ((seed * 137.5) % 360) * (Math.PI / 180)
  return {
    rotation: ((seed * 7.3) % 6) - 3,
    offsetX: Math.cos(angle) * 6,
    offsetY: Math.sin(angle) * 4,
  }
}

export function Stack({
  cards,
  className = '',
  sensitivity = 200,
  sendToBackOnClick = true,
  randomRotation = true,
  disabled = false,
  mobileClickOnly = true,
}: StackProps) {
  const reducedMotion = useReducedMotion()
  const [order, setOrder] = useState<number[]>(() =>
    cards.map((_, i) => i),
  )

  // Pre-compute random offsets per card index
  const [cardStates] = useState<CardState[]>(() =>
    cards.map((_, i) => ({
      id: i,
      ...(randomRotation ? getRandomOffset(i) : { rotation: 0, offsetX: 0, offsetY: 0 }),
    })),
  )

  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches

  const sendToBack = useCallback(
    (index: number) => {
      setOrder((prev) => {
        const next = [...prev]
        const pos = next.indexOf(index)
        if (pos <= 0) return prev
        next.splice(pos, 1)
        next.push(index)
        return next
      })
    },
    [],
  )

  return (
    <div className={`stack ${className}`}>
      {order.map((cardIndex, stackPosition) => {
        const isFront = stackPosition === order.length - 1
        const state = cardStates[cardIndex]
        const depth = stackPosition
        const scale = 1 - depth * 0.04
        const yOffset = depth * 8

        return (
          <StackCard
            key={cardIndex}
            index={cardIndex}
            isFront={isFront}
            scale={scale}
            yOffset={yOffset}
            rotation={state.rotation}
            offsetX={state.offsetX}
            offsetY={state.offsetY}
            sensitivity={sensitivity}
            disabled={disabled || !!reducedMotion}
            sendToBackOnClick={sendToBackOnClick}
            mobileClickOnly={mobileClickOnly}
            isMobile={isMobile}
            onSendToBack={sendToBack}
          >
            {cards[cardIndex]}
          </StackCard>
        )
      })}
    </div>
  )
}

type StackCardProps = {
  children: ReactNode
  index: number
  isFront: boolean
  scale: number
  yOffset: number
  rotation: number
  offsetX: number
  offsetY: number
  sensitivity: number
  disabled: boolean
  sendToBackOnClick: boolean
  mobileClickOnly: boolean
  isMobile: boolean
  onSendToBack: (index: number) => void
}

function StackCard({
  children,
  index,
  isFront,
  scale,
  yOffset,
  rotation,
  offsetX,
  offsetY,
  sensitivity,
  disabled,
  sendToBackOnClick,
  mobileClickOnly,
  isMobile,
  onSendToBack,
}: StackCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const dragRotation = useTransform(x, [-sensitivity, sensitivity], [-15, 15])
  const opacity = useTransform(
    y,
    [-sensitivity, -sensitivity / 2, 0],
    [0.9, 0.95, 1],
  )

  // Reset position when card is sent to back
  useEffect(() => {
    if (!isFront) {
      animate(x, 0, { duration: 0 })
      animate(y, 0, { duration: 0 })
    }
  }, [isFront, x, y])

  function handleClick() {
    if (!isFront || !sendToBackOnClick) return
    if (mobileClickOnly && !isMobile) return
    onSendToBack(index)
  }

  function handleDragEnd() {
    const currentX = x.get()
    const currentY = y.get()
    const distance = Math.sqrt(currentX * currentX + currentY * currentY)

    if (distance > sensitivity * 0.5 && sendToBackOnClick) {
      onSendToBack(index)
    }

    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
  }

  const style: CSSProperties = {
    zIndex: isFront ? 50 : 10 - index,
    scale,
    y: yOffset + offsetY,
    x: offsetX,
    rotate: `${rotation}deg`,
  }

  if (isFront && !disabled) {
    return (
      <motion.div
        className="stack-card"
        data-position="front"
        style={{ ...style, x, y, rotate: dragRotation, opacity }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        whileDrag={{ scale: 1.06, cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="stack-card"
      data-position="behind"
      style={style}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  )
}
