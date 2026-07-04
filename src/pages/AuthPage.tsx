import { useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import './AuthPage.css'

type AuthMode = 'signin' | 'signup'

const MAX_DISPLAY_NAME_LENGTH = 40
const MIN_PASSWORD_LENGTH = 8

export function AuthPage() {
  const { backendMessage, isConfigured, loading, signIn, signUp } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<string | null>(backendMessage)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'
  const disabled = loading || submitting || !isConfigured

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setStatus(backendMessage)
    setError(null)
  }

  const validateForm = (): string | null => {
    if (isSignUp) {
      const trimmedName = displayName.trim()
      if (!trimmedName) return 'Display name is required.'
      if (trimmedName.length > MAX_DISPLAY_NAME_LENGTH) return 'Display name is too long.'
      if (confirmPassword !== password) return 'Passwords do not match.'
    }

    if (!email.trim()) return 'Email is required.'
    if (password.length < MIN_PASSWORD_LENGTH) return 'Password must be at least 8 characters.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    const result = isSignUp
      ? await signUp({
          displayName: displayName.trim(),
          email: email.trim(),
          password,
        })
      : await signIn({
          email: email.trim(),
          password,
        })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setStatus(result.message ?? null)
    setError(null)
    if (result.requiresEmailConfirmation) {
      setPassword('')
      setConfirmPassword('')
      return
    }

    if (isSignUp) {
      setConfirmPassword('')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-panel">
          <p className="auth-kicker">Seiya Digital Journal</p>
          <h1 id="auth-title" className="auth-title">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="auth-copy">
            {isSignUp
              ? 'A small identity for leaving thoughtful traces.'
              : 'Sign in to continue your journey.'}
          </p>

          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={`auth-mode-button ${!isSignUp ? 'is-active' : ''}`}
              onClick={() => switchMode('signin')}
              aria-selected={!isSignUp}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-mode-button ${isSignUp ? 'is-active' : ''}`}
              onClick={() => switchMode('signup')}
              aria-selected={isSignUp}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp ? (
              <label className="auth-field">
                <span>Display name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  maxLength={MAX_DISPLAY_NAME_LENGTH}
                  disabled={disabled}
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={disabled}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                disabled={disabled}
              />
            </label>

            {isSignUp ? (
              <label className="auth-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={disabled}
                />
              </label>
            ) : null}

            {status ? <p className="auth-status">{status}</p> : null}
            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={disabled}>
              {submitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
