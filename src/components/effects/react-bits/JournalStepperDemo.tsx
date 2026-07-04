import { useId, useState } from 'react'

import { useAuth } from '../../../auth/AuthContext'
import { createComment } from '../../../lib/api'
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
  const [thought, setThought] = useState(() => loadSaved<string>(THOUGHT_KEY, ''))
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(backendMessage)

  const savedStep = loadSaved<number>(STEP_KEY, 1)
  const inputId = useId()

  const handleStepChange = (step: number) => {
    save(STEP_KEY, step)
  }

  const handleFinalCompleted = async () => {
    setStatus(null)
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
    save(THOUGHT_KEY, '')
    save(STEP_KEY, 1)
    return true
  }

  const handleThoughtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setThought(value)
    setStatus(null)
    setError(backendMessage)
    save(THOUGHT_KEY, value)
  }

  return (
    <>
      <Stepper
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
                Sign in to publish this comment. <a href="#/auth">Sign in</a>
              </p>
            ) : null}
          </div>
        </Step>
        <Step>
          <h2>Archive the moment.</h2>
          <p>The entry is ready to grow with you.</p>
        </Step>
      </Stepper>
      {status ? (
        <p className="stepper-demo__status" role="status">{status}</p>
      ) : null}
      {error ? (
        <p className="stepper-demo__error" role="alert">{error}</p>
      ) : null}
    </>
  )
}
