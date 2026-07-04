import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

import { useAuth } from '../../../auth/AuthContext'
import { createComment } from '../../../lib/api'
import {
  COMMENT_SUCCESS_FADE_MS,
  scheduleCommentSuccessLifecycle,
} from '../../../lib/commentSuccess'
import { navigateToAuth } from '../../../lib/authRoutes'
import { ARCHIVE_STEPPER_TARGET } from '../../../lib/interactions'
import Stepper, { Step } from './Stepper'

const STEP_KEY = 'archive-stepper-step'
const THOUGHT_KEY = 'archive-stepper-thought'

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded — silently ignore */ }
}

export function JournalStepperDemo() {
  const { backendMessage, isAuthenticated, isConfigured } = useAuth()
  const reduceMotion = useReducedMotion()
  const [thought, setThought] = useState(() => loadSaved<string>(THOUGHT_KEY, ''))
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(backendMessage)
  const [isStatusVisible, setIsStatusVisible] = useState(false)
  const [stepperKey, setStepperKey] = useState(0)

  const savedStep = loadSaved<number>(STEP_KEY, 1)
  const inputId = useId()
  const cleanupRef = useRef<(() => void) | null>(null)

  const clearSuccessLifecycle = () => {
    cleanupRef.current?.()
    cleanupRef.current = null
  }

  useEffect(() => () => {
    clearSuccessLifecycle()
  }, [])

  const handleStepChange = (step: number) => {
    save(STEP_KEY, step)
  }

  const handleFinalCompleted = async () => {
    clearSuccessLifecycle()
    setStatus(null)
    setIsStatusVisible(false)
    setError(null)

    if (!isConfigured) {
      setError('Backend is not configured.')
      return false
    }

    if (!isAuthenticated) {
      setError('Sign in to publish this comment.')
      return false
    }

    const result = await createComment({
      targetType: ARCHIVE_STEPPER_TARGET.targetType,
      targetId: ARCHIVE_STEPPER_TARGET.targetId,
      body: thought,
    })

    if (!result.ok) {
      setError(result.error.message)
      return false
    }

    setThought('')
    setStatus('Comment published.')
    setIsStatusVisible(true)
    save(THOUGHT_KEY, '')
    save(STEP_KEY, 1)
    cleanupRef.current = scheduleCommentSuccessLifecycle(
      {
        setTimeout,
        clearTimeout,
      },
      {
        onFadeStart: () => {
          setIsStatusVisible(false)
        },
        onReset: () => {
          setStatus(null)
          setStepperKey((current) => current + 1)
        },
      },
    )
    return true
  }

  const handleThoughtChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    clearSuccessLifecycle()
    setThought(value)
    setStatus(null)
    setIsStatusVisible(false)
    setError(backendMessage)
    save(THOUGHT_KEY, value)
  }

  return (
    <>
      <Stepper
        key={stepperKey}
        nextButtonText="Continue"
        initialStep={savedStep}
        onStepChange={handleStepChange}
        onFinalStepCompleted={handleFinalCompleted}
      >
        <Step>
          <h2>Welcome to the journal.</h2>
          <p>A quiet place to notice what matters.</p>
        </Step>
        <Step>
          <h2>Observe the signal.</h2>
          <p>Collect the small details before they disappear.</p>
        </Step>
        <Step>
          <h2>Write one thought.</h2>
          <p>Give today a sentence worth keeping.</p>
          <div className="stepper-demo__field">
            <label className="stepper-demo__label" htmlFor={inputId}>
              One thought from today
            </label>
            <input
              id={inputId}
              className="stepper-demo__input"
              value={thought}
              onChange={handleThoughtChange}
              placeholder="What stayed with you today?"
              autoComplete="off"
            />
            {!isAuthenticated ? (
              <p className="stepper-demo__hint">
                Sign in to publish this comment. <a href="#/auth" onClick={(event) => {
                  event.preventDefault()
                  navigateToAuth()
                }}
                >Sign in</a>
              </p>
            ) : null}
          </div>
        </Step>
        <Step>
          <h2>Archive the moment.</h2>
          <p>The entry is ready to grow with you.</p>
        </Step>
      </Stepper>
      <AnimatePresence initial={false}>
        {status ? (
          <motion.p
            className="stepper-demo__status"
            role="status"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={isStatusVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : COMMENT_SUCCESS_FADE_MS / 1000 }}
          >
            {status}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {error ? (
        <p className="stepper-demo__error" role="alert">{error}</p>
      ) : null}
    </>
  )
}
