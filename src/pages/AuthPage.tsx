import { AnimatePresence, motion, useReducedMotion, type AnimationDefinition, type Variants } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Mail } from 'lucide-react'
import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

import { useAuth } from '../auth/AuthContext'
import {
  createEmptyAuthFormValues,
  hasAuthFieldErrors,
  validateAuthField,
  validateAuthForm,
  type AuthFieldErrors,
  type AuthFieldName,
  type AuthMode,
} from '../lib/authForm'
import { resolveAuthSuccessOutcome } from '../lib/authFlow'
import {
  consumeAuthReturnTarget,
} from '../lib/authRoutes'
import './AuthPage.css'

type AuthView = 'signin' | 'signup' | 'check-email'
type FeedbackTone = 'error' | 'success' | 'info'
type AuthFeedback = {
  tone: FeedbackTone
  message: string
} | null
type TouchedFields = Partial<Record<AuthFieldName, boolean>>

const easeOut = [0.22, 1, 0.36, 1] as const

const fieldContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
}

const fieldItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: easeOut },
  },
}

export function AuthPage() {
  const { backendMessage, isAuthenticated, isConfigured, loading, signIn, signUp } = useAuth()
  const reduceMotion = useReducedMotion() ?? false

  const [view, setView] = useState<AuthView>('signin')
  const [values, setValues] = useState(createEmptyAuthFormValues)
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({})
  const [submittingMode, setSubmittingMode] = useState<AuthMode | null>(null)
  const [feedback, setFeedback] = useState<AuthFeedback>(
    backendMessage ? { tone: 'info', message: backendMessage } : null,
  )
  const [maskedEmail, setMaskedEmail] = useState('your email')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)

  const emailInputId = useId()
  const passwordInputId = useId()
  const displayNameInputId = useId()
  const confirmPasswordInputId = useId()
  const feedbackId = useId()

  const isSignUp = view === 'signup'
  const disabled = loading || Boolean(submittingMode) || !isConfigured

  useEffect(() => {
    if (backendMessage) {
      setFeedback({ tone: 'info', message: backendMessage })
    }
  }, [backendMessage])

  useEffect(() => {
    if (loading || !isAuthenticated || view === 'check-email' || submittingMode || isExiting || isNavigatingBack) return

    if (reduceMotion) {
      window.location.hash = consumeAuthReturnTarget()
      return
    }

    setIsExiting(true)
  }, [isAuthenticated, loading, view, submittingMode, reduceMotion, isExiting, isNavigatingBack])

  const switchView = (nextView: AuthView) => {
    setView(nextView)
    setFieldErrors({})
    setTouchedFields({})
    setSubmittingMode(null)
    setFeedback(backendMessage ? { tone: 'info', message: backendMessage } : null)
    if (nextView !== 'signup') {
      setShowConfirmPassword(false)
    }
  }

  const updateFieldError = (mode: AuthMode, field: AuthFieldName, nextValues = values) => {
    if (!touchedFields[field]) return
    const nextError = validateAuthField(mode, field, nextValues)
    setFieldErrors((current) => {
      if (!nextError) {
        const { [field]: _omitted, ...rest } = current
        return rest
      }
      return {
        ...current,
        [field]: nextError,
      }
    })
  }

  const handleFieldChange = (field: AuthFieldName, value: string) => {
    const nextValues = {
      ...values,
      [field]: value,
    }
    setValues(nextValues)
    if (feedback?.tone === 'error') setFeedback(null)
    const mode: AuthMode = isSignUp ? 'signup' : 'signin'
    updateFieldError(mode, field, nextValues)
    if (field === 'password' && isSignUp) {
      updateFieldError('signup', 'confirmPassword', nextValues)
    }
  }

  const handleFieldBlur = (field: AuthFieldName) => {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }))
    const mode: AuthMode = isSignUp ? 'signup' : 'signin'
    const nextError = validateAuthField(mode, field, values)
    setFieldErrors((current) => {
      if (!nextError) {
        const { [field]: _omitted, ...rest } = current
        return rest
      }
      return {
        ...current,
        [field]: nextError,
      }
    })
  }

  const handleBack = () => {
    if (reduceMotion) {
      window.location.hash = consumeAuthReturnTarget()
      return
    }
    setIsNavigatingBack(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    const mode: AuthMode = isSignUp ? 'signup' : 'signin'
    const nextErrors = validateAuthForm(mode, values)
    setFieldErrors(nextErrors)
    setTouchedFields(mode === 'signup'
      ? {
          displayName: true,
          email: true,
          password: true,
          confirmPassword: true,
        }
      : {
          email: true,
          password: true,
        })

    if (hasAuthFieldErrors(nextErrors)) {
      return
    }

    setSubmittingMode(mode)
    const result = isSignUp
      ? await signUp({
          displayName: values.displayName.trim(),
          email: values.email.trim(),
          password: values.password,
        })
      : await signIn({
          email: values.email.trim(),
          password: values.password,
        })
    setSubmittingMode(null)

    if (!result.ok) {
      setFeedback({ tone: 'error', message: result.message })
      if (!isSignUp) {
        setValues((current) => ({
          ...current,
          password: '',
        }))
      }
      return
    }

    const successOutcome = resolveAuthSuccessOutcome(mode, values.email, Boolean(result.requiresEmailConfirmation))

    if (successOutcome.kind === 'check-email') {
      setMaskedEmail(successOutcome.maskedEmail)
      setValues((current) => ({
        ...current,
        password: '',
        confirmPassword: '',
      }))
      setShowPassword(false)
      setShowConfirmPassword(false)
      setFieldErrors({})
      setTouchedFields({})
      setFeedback(null)
      setView('check-email')
      return
    }

    setFeedback({
      tone: 'success',
      message: successOutcome.message,
    })
  }

  const handleViewAnimationComplete = (definition: AnimationDefinition) => {
    if (isExiting && !isNavigatingBack && typeof definition === 'object' && definition !== null && 'opacity' in definition && definition.opacity === 0) {
      window.location.hash = consumeAuthReturnTarget()
    }
  }

  const handlePageAnimationComplete = (definition: AnimationDefinition) => {
    if (isNavigatingBack && typeof definition === 'object' && definition !== null && 'opacity' in definition && definition.opacity === 0) {
      window.location.hash = consumeAuthReturnTarget()
    }
  }

  const viewExit = reduceMotion
    ? undefined
    : isExiting
      ? { opacity: 0, y: -8, scale: 0.985 }
      : { opacity: 0, y: -8 }

  return (
    <motion.main
      className="auth-page"
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: easeOut }}
      onAnimationComplete={handlePageAnimationComplete}
    >
      <section className="auth-shell" aria-labelledby="auth-title">
        <motion.div
          className="auth-panel"
          layout
          transition={{ layout: { duration: 0.31, ease: easeOut } }}
        >
          <button type="button" className="auth-back" onClick={handleBack}>
            <ArrowLeft aria-hidden="true" size={16} />
            <span>Back</span>
          </button>
          <p className="auth-kicker">Seiya Digital Journal</p>
          <AnimatePresence mode="wait" initial={false}>
            {view === 'check-email' ? (
              <motion.div
                key="check-email"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={viewExit}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: easeOut }}
                className="auth-view"
                onAnimationComplete={handleViewAnimationComplete}
              >
                <motion.div
                  className="auth-check-email-icon"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: easeOut }}
                >
                  <Mail size={20} aria-hidden="true" />
                </motion.div>

                <motion.h1
                  id="auth-title"
                  className="auth-title"
                  initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.04, ease: easeOut }}
                >
                  Check your email
                </motion.h1>

                <motion.p
                  className="auth-copy"
                  initial={reduceMotion ? false : { opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.08, ease: easeOut }}
                >
                  We sent a confirmation link to:
                </motion.p>

                <p className="auth-email">{maskedEmail}</p>

                <motion.p
                  className="auth-copy"
                  initial={reduceMotion ? false : { opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1, ease: easeOut }}
                >
                  Confirm your email to finish creating your account.
                </motion.p>

                <motion.p
                  className="auth-note"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.12 }}
                >
                  Check your spam folder if you do not see the email.
                </motion.p>

                <motion.button
                  type="button"
                  className="auth-submit auth-submit--secondary"
                  onClick={() => switchView('signin')}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.14 }}
                >
                  Back to sign in
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={viewExit}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
                className="auth-view"
                onAnimationComplete={handleViewAnimationComplete}
              >
                <motion.h1
                  id="auth-title"
                  className="auth-title"
                  initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: easeOut }}
                >
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </motion.h1>
                <motion.p
                  className="auth-copy"
                  initial={reduceMotion ? false : { opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.03, ease: easeOut }}
                >
                  {isSignUp
                    ? 'Join the journal with a simple identity.'
                    : 'Sign in to continue.'}
                </motion.p>

                <div className="auth-feedback-slot" aria-live="polite">
                  <AnimatePresence mode="wait">
                    {feedback ? (
                      <motion.p
                        key={feedback.message}
                        id={feedbackId}
                        className={`auth-feedback auth-feedback--${feedback.tone}`}
                        role={feedback.tone === 'error' ? 'alert' : 'status'}
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        {feedback.message}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>

                <motion.form
                  className="auth-form"
                  onSubmit={handleSubmit}
                  aria-busy={Boolean(submittingMode)}
                  variants={isSignUp ? fieldContainerVariants : undefined}
                  initial={isSignUp ? 'hidden' : false}
                  animate={isSignUp ? 'visible' : undefined}
                >
                  {isSignUp ? (
                    <motion.div variants={fieldItemVariants}>
                      <AuthField
                        id={displayNameInputId}
                        label="Display name"
                        value={values.displayName}
                        onChange={(value) => handleFieldChange('displayName', value)}
                        onBlur={() => handleFieldBlur('displayName')}
                        autoComplete="name"
                        disabled={disabled}
                        error={fieldErrors.displayName}
                      />
                    </motion.div>
                  ) : null}

                  <motion.div variants={isSignUp ? fieldItemVariants : undefined}>
                    <AuthField
                      id={emailInputId}
                      label="Email"
                      type="email"
                      value={values.email}
                      onChange={(value) => handleFieldChange('email', value)}
                      onBlur={() => handleFieldBlur('email')}
                      autoComplete="email"
                      disabled={disabled}
                      error={fieldErrors.email}
                      describedBy={feedback?.tone === 'error' ? feedbackId : undefined}
                    />
                  </motion.div>

                  <motion.div variants={isSignUp ? fieldItemVariants : undefined}>
                    <AuthField
                      id={passwordInputId}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={(value) => handleFieldChange('password', value)}
                      onBlur={() => handleFieldBlur('password')}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      disabled={disabled}
                      error={fieldErrors.password}
                      describedBy={feedback?.tone === 'error' ? feedbackId : undefined}
                      trailingButton={
                        <PasswordToggle
                          visible={showPassword}
                          onToggle={() => setShowPassword((current) => !current)}
                          disabled={disabled}
                          label={showPassword ? 'Hide password' : 'Show password'}
                          reduceMotion={reduceMotion}
                        />
                      }
                    />
                  </motion.div>

                  {isSignUp ? (
                    <motion.div variants={fieldItemVariants}>
                      <AuthField
                        id={confirmPasswordInputId}
                        label="Confirm password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={(value) => handleFieldChange('confirmPassword', value)}
                        onBlur={() => handleFieldBlur('confirmPassword')}
                        autoComplete="new-password"
                        disabled={disabled}
                        error={fieldErrors.confirmPassword}
                        trailingButton={
                          <PasswordToggle
                            visible={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword((current) => !current)}
                            disabled={disabled}
                            label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                            reduceMotion={reduceMotion}
                          />
                        }
                      />
                    </motion.div>
                  ) : null}

                  <motion.div variants={isSignUp ? fieldItemVariants : undefined}>
                    <button className="auth-submit" type="submit" disabled={disabled}>
                      {submittingMode ? (
                        <>
                          <LoaderCircle className="auth-spinner" size={16} aria-hidden="true" />
                          <span>{submittingMode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        isSignUp ? 'Create account' : 'Sign in'
                      )}
                    </button>
                  </motion.div>
                </motion.form>

                <p className="auth-switch-copy">
                  {isSignUp ? 'Already have an account?' : 'New here?'}
                  {' '}
                  <button
                    type="button"
                    className="auth-switch-button"
                    onClick={() => switchView(isSignUp ? 'signin' : 'signup')}
                  >
                    {isSignUp ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>
    </motion.main>
  )
}

type AuthFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  disabled: boolean
  error?: string
  type?: string
  autoComplete?: string
  trailingButton?: ReactNode
  describedBy?: string
}

function AuthField({
  id,
  label,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  type = 'text',
  autoComplete,
  trailingButton,
  describedBy,
}: AuthFieldProps) {
  const errorId = `${id}-error`
  const ariaDescribedBy = [error ? errorId : null, describedBy].filter(Boolean).join(' ') || undefined

  return (
    <label className="auth-field" htmlFor={id}>
      <span>{label}</span>
      <span className={`auth-input-shell ${error ? 'is-error' : ''}`}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={ariaDescribedBy}
        />
        {trailingButton}
      </span>
      {error ? (
        <span id={errorId} className="auth-field-error">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function PasswordToggle({
  visible,
  onToggle,
  disabled,
  label,
  reduceMotion,
}: {
  visible: boolean
  onToggle: () => void
  disabled: boolean
  label: string
  reduceMotion: boolean
}) {
  return (
    <motion.button
      type="button"
      className="auth-password-toggle"
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      whileTap={reduceMotion ? undefined : { scale: 0.92, rotate: -8 }}
      transition={{ duration: 0.12 }}
    >
      {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
    </motion.button>
  )
}
