import { maskEmailAddress, type AuthMode } from './authForm.ts'

export type AuthSuccessOutcome =
  | {
      kind: 'redirect'
      message: string
    }
  | {
      kind: 'check-email'
      message: string
      maskedEmail: string
    }

export function resolveAuthSuccessOutcome(
  mode: AuthMode,
  email: string,
  requiresEmailConfirmation: boolean,
): AuthSuccessOutcome {
  if (mode === 'signup' && requiresEmailConfirmation) {
    return {
      kind: 'check-email',
      message: 'Check your email to confirm your account.',
      maskedEmail: maskEmailAddress(email),
    }
  }

  return {
    kind: 'redirect',
    message: mode === 'signup' ? 'Account created successfully.' : 'Signed in successfully.',
  }
}
