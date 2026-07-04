import { AnimatePresence, motion } from 'framer-motion'
import {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

import './Stepper.css'

type StepIndicatorRenderProps = {
  step: number
  currentStep: number
  onStepClick: (step: number) => void
}

export type StepperProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: ReactNode
  initialStep?: number
  onStepChange?: (step: number) => void
  onFinalStepCompleted?: () => void | boolean | Promise<void | boolean>
  stepCircleContainerClassName?: string
  stepContainerClassName?: string
  contentClassName?: string
  footerClassName?: string
  backButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>
  nextButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>
  backButtonText?: string
  nextButtonText?: string
  disableStepIndicators?: boolean
  renderStepIndicator?: (props: StepIndicatorRenderProps) => ReactNode
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  renderStepIndicator,
  className = '',
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [direction, setDirection] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const stepsArray = Children.toArray(children)
  const totalSteps = stepsArray.length
  const isCompleted = currentStep > totalSteps
  const isLastStep = currentStep === totalSteps
  const {
    className: backButtonClassName = '',
    ...backButtonRest
  } = backButtonProps
  const {
    className: nextButtonClassName = '',
    ...nextButtonRest
  } = nextButtonProps

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep)
    onStepChange(newStep)
  }

  const goToStep = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1)
    updateStep(newStep)
  }

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1)
  }

  const handleNext = () => {
    if (!isLastStep) goToStep(currentStep + 1)
  }

  const handleComplete = async () => {
    setDirection(1)
    setIsCompleting(true)
    const result = await onFinalStepCompleted()
    setIsCompleting(false)
    if (result === false) return
    onStepChange(totalSteps + 1)
    setCurrentStep(totalSteps + 1)
  }

  return (
    <div className={`stepper-outer ${className}`.trim()} {...rest}>
      <div className={`stepper-circle-container ${stepCircleContainerClassName}`.trim()}>
        <div className={`stepper-indicator-row ${stepContainerClassName}`.trim()}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1
            const isNotLastStep = index < totalSteps - 1

            return (
              <div className="stepper-indicator-group" key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: goToStep,
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={goToStep}
                  />
                )}
                {isNotLastStep ? (
                  <StepConnector isComplete={currentStep > stepNumber} />
                ) : null}
              </div>
            )
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`stepper-content-default ${contentClassName}`.trim()}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted ? (
          <div className={`stepper-footer ${footerClassName}`.trim()}>
            <div className={`stepper-footer-nav ${currentStep !== 1 ? 'stepper-footer-nav--spread' : 'stepper-footer-nav--end'}`}>
              {currentStep !== 1 ? (
                <button
                  {...backButtonRest}
                  type="button"
                  onClick={handleBack}
                  disabled={isCompleting || backButtonRest.disabled}
                  className={`stepper-back-button ${backButtonClassName}`.trim()}
                >
                  {backButtonText}
                </button>
              ) : null}
              <button
                {...nextButtonRest}
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                disabled={isCompleting || nextButtonRest.disabled}
                className={`stepper-next-button ${nextButtonClassName}`.trim()}
              >
                {isLastStep ? (isCompleting ? 'Sending...' : 'Complete') : nextButtonText}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

type StepContentWrapperProps = {
  isCompleted: boolean
  currentStep: number
  direction: number
  children: ReactNode
  className: string
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState(0)

  return (
    <motion.div
      className={className}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted ? (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={setParentHeight}
          >
            {children}
          </SlideTransition>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

type SlideTransitionProps = {
  children: ReactNode
  direction: number
  onHeightReady: (height: number) => void
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight)
  }, [children, onHeightReady])

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="stepper-slide"
    >
      {children}
    </motion.div>
  )
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
}

export function Step({ children }: { children: ReactNode }) {
  return <div className="stepper-step">{children}</div>
}

type StepIndicatorProps = {
  step: number
  currentStep: number
  onClickStep: (step: number) => void
  disableStepIndicators: boolean
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: StepIndicatorProps) {
  const status = currentStep === step
    ? 'active'
    : currentStep < step
      ? 'inactive'
      : 'complete'

  return (
    <motion.button
      type="button"
      className="stepper-indicator"
      onClick={() => {
        if (step !== currentStep) onClickStep(step)
      }}
      disabled={disableStepIndicators}
      aria-current={status === 'active' ? 'step' : undefined}
      aria-label={`Go to step ${step}`}
      animate={status}
      initial={false}
    >
      <motion.span
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: 'var(--color-bg-deep)',
            color: 'var(--color-muted)',
          },
          active: {
            scale: 1,
            backgroundColor: 'var(--color-violet)',
            color: 'var(--color-violet)',
          },
          complete: {
            scale: 1,
            backgroundColor: 'var(--color-violet)',
            color: 'var(--color-cyan)',
          },
        }}
        transition={{ duration: 0.3 }}
        className="stepper-indicator-inner"
      >
        {status === 'complete' ? (
          <CheckIcon className="stepper-check-icon" />
        ) : status === 'active' ? (
          <span className="stepper-active-dot" />
        ) : (
          <span className="stepper-step-number">{step}</span>
        )}
      </motion.span>
    </motion.button>
  )
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <span className="stepper-connector" aria-hidden="true">
      <motion.span
        className="stepper-connector-inner"
        variants={{
          incomplete: { width: 0, backgroundColor: 'transparent' },
          complete: { width: '100%', backgroundColor: 'var(--color-violet)' },
        }}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </span>
  )
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}
