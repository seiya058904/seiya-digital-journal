import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Circle, CircleCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { getNextLoaderState } from './multiStepLoaderState'
import './MultiStepLoader.css'

export type LoadingState = {
  text: string
}

export type MultiStepLoaderProps = {
  loadingStates: LoadingState[]
  loading: boolean
  duration?: number
  loop?: boolean
  onClose: () => void
}

export function MultiStepLoader({
  loadingStates,
  loading,
  duration = 1600,
  loop = false,
  onClose,
}: MultiStepLoaderProps) {
  const [currentState, setCurrentState] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!loading || loadingStates.length === 0) {
      setCurrentState(0)
      return
    }

    const timeout = window.setTimeout(() => {
      const nextState = getNextLoaderState(currentState, loadingStates.length, loop)
      if (nextState === null) {
        onClose()
        return
      }
      setCurrentState(nextState)
    }, duration)

    return () => window.clearTimeout(timeout)
  }, [currentState, duration, loading, loadingStates.length, loop, onClose])

  useEffect(() => {
    if (!loading) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [loading, onClose])

  const activeState = Math.min(currentState, loadingStates.length - 1)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {loading && loadingStates.length > 0 ? (
        <motion.div
          className="multi-step-loader"
          role="dialog"
          aria-label="Loading progress"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.25 }}
        >
          <button
            type="button"
            className="multi-step-loader__close"
            onClick={onClose}
            aria-label="Close loading progress"
            autoFocus
          >
            <X aria-hidden="true" />
          </button>

          <p className="multi-step-loader__status" aria-live="polite" aria-atomic="true">
            {loadingStates[activeState].text}
          </p>

          <div className="multi-step-loader__viewport">
            <div className="multi-step-loader__steps">
              {loadingStates.map((loadingState, index) => {
                const distance = Math.abs(index - activeState)
                const opacity = Math.max(1 - distance * 0.2, 0)
                const complete = index <= activeState

                return (
                  <motion.div
                    key={loadingState.text}
                    className="multi-step-loader__step"
                    aria-current={index === activeState ? 'step' : undefined}
                    initial={{ opacity: 0, y: -(activeState * 40) }}
                    animate={{
                      opacity,
                      y: reducedMotion ? 0 : -(activeState * 40),
                    }}
                    transition={{ duration: reducedMotion ? 0 : 0.5 }}
                  >
                    {complete ? (
                      <CircleCheck aria-hidden="true" />
                    ) : (
                      <Circle aria-hidden="true" />
                    )}
                    <span>{loadingState.text}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
