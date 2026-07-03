import { useId, useState } from 'react'

import Stepper, { Step } from './Stepper'

const STEP_KEY = 'archive-stepper-step'
const THOUGHT_KEY = 'archive-stepper-thought'
const COMPLETED_KEY = 'archive-stepper-completed'

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
  const [thought, setThought] = useState(() => loadSaved<string>(THOUGHT_KEY, ''))

  const savedStep = loadSaved<number>(STEP_KEY, 1)
  const completed = loadSaved<boolean>(COMPLETED_KEY, false)
  const effectiveStep = completed ? 5 : savedStep
  const inputId = useId()

  const handleStepChange = (step: number) => {
    save(STEP_KEY, step)
  }

  const handleFinalCompleted = () => {
    save(STEP_KEY, 5)
    save(COMPLETED_KEY, true)
  }

  const handleThoughtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setThought(value)
    save(THOUGHT_KEY, value)
  }

  return (
    <Stepper
      nextButtonText="Continue"
      initialStep={effectiveStep}
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
        </div>
      </Step>
      <Step>
        <h2>Archive the moment.</h2>
        <p>The entry is ready to grow with you.</p>
      </Step>
    </Stepper>
  )
}
