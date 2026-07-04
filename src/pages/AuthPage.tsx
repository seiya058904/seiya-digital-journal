import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'

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

export function AuthPage() {
  const { backendMessage, isAuthenticated, isConfigured, loading, signIn, signUp } = useAuth()
  const reduceMotion = useReducedMotion()

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

  const emailInputId = useId()
  const passwordInputId = useId()
  const displayNameInputId = useId()
  const confirmPasswordInputId = useId()
  const feedbackId = useId()
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSignUp = view === 'signup'
  const disabled = loading || Boolean(submittingMode) || !isConfigured
  const clearNavigationTimer = () => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
      navigationTimeoutRef.current = null
    }
  }

  useEffect(() => () => {
    clearNavigationTimer()
  }, [])

  useEffect(() => {
    if (backendMessage) {
      setFeedback({ tone: 'info', message: backendMessage })
    }
  }, [backendMessage])

  const scheduleReturnNavigation = useCallback((target: string) => {
    clearNavigationTimer()
    navigationTimeoutRef.current = setTimeout(() => {
      window.location.hash = target
    }, reduceMotion ? 200 : 320)
  }, [reduceMotion])

  useEffect(() => {
    if (loading || !isAuthenticated || view === 'check-email' || submittingMode) return
    setFeedback({ tone: 'success', message: 'Signed in successfully.' })
    scheduleReturnNavigation(consumeAuthReturnTarget())
  }, [isAuthenticated, loading, scheduleReturnNavigation, submittingMode, view])

  const switchView = (nextView: AuthView) => {
    clearNavigationTimer()
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
    clearNavigationTimer()
    window.location.hash = consumeAuthReturnTarget()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearNavigationTimer()
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

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-panel">
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
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="auth-view"
              >
                <h1 id="auth-title" className="auth-title">Check your email</h1>
                <p className="auth-copy">
                  We sent a confirmation link to:
                </p>
                <p className="auth-email">{maskedEmail}</p>
                <p className="auth-copy">
                  Confirm your email to finish creating your account.
                </p>
                <p className="auth-note">
                  Check your spam folder if you do not see the email.
                </p>
                <button
                  type="button"
                  className="auth-submit auth-submit--secondary"
                  onClick={() => switchView('signin')}
                >
                  Back to sign in
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="auth-view"
              >
                <h1 id="auth-title" className="auth-title">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="auth-copy">
                  {isSignUp
                    ? 'Join the journal with a simple identity.'
                    : 'Sign in to continue.'}
                </p>

                <div className="auth-feedback-slot" aria-live="polite">
                  {feedback ? (
                    <p
                      id={feedbackId}
                      className={`auth-feedback auth-feedback--${feedback.tone}`}
                      role={feedback.tone === 'error' ? 'alert' : 'status'}
                    >
                      {feedback.message}
                    </p>
                  ) : null}
                </div>

                <form className="auth-form" onSubmit={handleSubmit} aria-busy={Boolean(submittingMode)}>
                  {isSignUp ? (
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
                  ) : null}

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
                      />
                    }
                  />

                  {isSignUp ? (
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
                        />
                      }
                    />
                  ) : null}

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
                </form>

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
        </div>
      </section>
    </main>
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
}: {
  visible: boolean
  onToggle: () => void
  disabled: boolean
  label: string
}) {
  return (
    <button
      type="button"
      className="auth-password-toggle"
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
    >
      {visible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
    </button>
  )
}
