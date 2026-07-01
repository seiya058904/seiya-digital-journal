import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

import './RotatingText.css'

type SplitBy = 'character' | 'word' | 'line' | 'none'
type StaggerFrom = 'first' | 'last' | 'center' | 'random'

type MotionVariant = {
  opacity?: number
  y?: string | number
  x?: string | number
  rotateX?: number
  rotateY?: number
  scale?: number
  filter?: string
}

type RotatingTextProps = {
  texts: string[]
  transition?: object
  initial?: MotionVariant
  animate?: MotionVariant
  exit?: MotionVariant
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: StaggerFrom
  loop?: boolean
  auto?: boolean
  splitBy?: SplitBy
  mainClassName?: string
  splitLevelClassName?: string
  elementLevelClassName?: string
  className?: string
}

type RotatingTextRef = {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

function getStaggerDelay(
  index: number,
  total: number,
  staggerFrom: StaggerFrom,
  staggerDuration: number,
): number {
  switch (staggerFrom) {
    case 'first':
      return index * staggerDuration
    case 'last':
      return (total - 1 - index) * staggerDuration
    case 'center': {
      const center = Math.floor(total / 2)
      return Math.abs(center - index) * staggerDuration
    }
    case 'random':
      return Math.random() * (total - 1) * staggerDuration
  }
}

function splitText(text: string, splitBy: SplitBy): string[] {
  switch (splitBy) {
    case 'character':
      return splitIntoCharacters(text)
    case 'word':
      return text.split(' ')
    case 'line':
      return text.split('\n')
    case 'none':
      return [text]
  }
}

const DEFAULT_INITIAL: MotionVariant = { opacity: 0, y: 20 }
const DEFAULT_ANIMATE: MotionVariant = { opacity: 1, y: 0 }
const DEFAULT_EXIT: MotionVariant = { opacity: 0, y: -20 }

export const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(function RotatingText(
  {
    texts,
    transition = { type: 'spring', damping: 25, stiffness: 300 },
    initial = DEFAULT_INITIAL,
    animate = DEFAULT_ANIMATE,
    exit = DEFAULT_EXIT,
    rotationInterval = 2000,
    staggerDuration = 0.03,
    staggerFrom = 'first',
    loop = true,
    auto = true,
    splitBy = 'word',
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    className,
  },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const [currentIdx, setCurrentIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback(
    (nextIdx: number) => {
      if (texts.length === 0) return
      const bounded = ((nextIdx % texts.length) + texts.length) % texts.length
      if (bounded === currentIdx) return
      setCurrentIdx(bounded)
    },
    [texts.length, currentIdx],
  )

  const next = useCallback(() => {
    if (currentIdx === texts.length - 1 && !loop) return
    goTo(currentIdx + 1)
  }, [currentIdx, texts.length, loop, goTo])

  const previous = useCallback(() => {
    if (currentIdx === 0 && !loop) return
    goTo(currentIdx - 1)
  }, [currentIdx, loop, goTo])

  const reset = useCallback(() => {
    setCurrentIdx(0)
  }, [])

  useImperativeHandle(ref, () => ({ next, previous, jumpTo: goTo, reset }), [next, previous, goTo, reset])

  // Auto-rotation timer
  useEffect(() => {
    if (!auto || reducedMotion) return
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        const nextIdx = prev + 1
        if (nextIdx >= texts.length && !loop) return prev
        return nextIdx % texts.length
      })
    }, rotationInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [auto, reducedMotion, texts.length, loop, rotationInterval])

  // Reduced motion: show static text, no animation
  if (reducedMotion) {
    return (
      <span className={`rotating-text ${className ?? ''}`}>
        <span className={mainClassName}>{texts[0]}</span>
      </span>
    )
  }

  const currentText = texts[currentIdx] ?? texts[0] ?? ''
  const parts = splitText(currentText, splitBy)
  const needSeparator = splitBy === 'word'

  return (
    <span className={`rotating-text ${className ?? ''}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIdx}
          className={mainClassName}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
        >
          <span className={`text-split text-split--${splitBy} ${splitLevelClassName ?? ''}`}>
            {parts.map((part, i) => {
              const delay = getStaggerDelay(i, parts.length, staggerFrom, staggerDuration)
              const elementClasses = [
                'stagger-element',
                'stagger-element--visible',
                elementLevelClassName ?? '',
              ].filter(Boolean).join(' ')

              return (
                <span
                  key={`${currentIdx}-${i}`}
                  className={`text-split__element ${elementClasses}`}
                  style={{
                    animationDelay: `${delay}s`,
                    display: splitBy === 'character' ? 'inline-block' : undefined,
                  }}
                >
                  {part}
                  {needSeparator && i < parts.length - 1 ? ' ' : ''}
                </span>
              )
            })}
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  )
})
