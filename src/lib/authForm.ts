const MAX_DISPLAY_NAME_LENGTH = 40
const MIN_PASSWORD_LENGTH = 8

export type AuthMode = 'signin' | 'signup'
export type AuthFieldName = 'displayName' | 'email' | 'password' | 'confirmPassword'

export type AuthFormValues = {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>

export function createEmptyAuthFormValues(): AuthFormValues {
  return {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
}

export function validateAuthField(
  mode: AuthMode,
  field: AuthFieldName,
  values: AuthFormValues,
): string | null {
  if (field === 'displayName') {
    if (mode !== 'signup') return null
    const trimmedName = values.displayName.trim()
    if (!trimmedName) return 'Display name is required.'
    if (trimmedName.length > MAX_DISPLAY_NAME_LENGTH) return 'Display name is too long.'
    return null
  }

  if (field === 'email') {
    const trimmedEmail = values.email.trim()
    if (!trimmedEmail) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Enter a valid email address.'
    }
    return null
  }

  if (field === 'password') {
    if (!values.password) return 'Password is required.'
    if (values.password.length < MIN_PASSWORD_LENGTH) {
      return 'Password must be at least 8 characters.'
    }
    return null
  }

  if (mode !== 'signup') return null
  if (!values.confirmPassword) return 'Confirm your password.'
  if (values.confirmPassword !== values.password) return 'Passwords do not match.'
  return null
}

export function validateAuthForm(mode: AuthMode, values: AuthFormValues): AuthFieldErrors {
  const fields: AuthFieldName[] = mode === 'signup'
    ? ['displayName', 'email', 'password', 'confirmPassword']
    : ['email', 'password']

  const errors: AuthFieldErrors = {}
  for (const field of fields) {
    const error = validateAuthField(mode, field, values)
    if (error) errors[field] = error
  }
  return errors
}

export function hasAuthFieldErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0
}

export function maskEmailAddress(email: string): string {
  const [localPart = '', domain = ''] = email.trim().split('@')
  if (!localPart || !domain) return 'your email'

  const maskedLocal = localPart.length <= 2
    ? `${localPart[0] ?? ''}*`
    : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(2, localPart.length - 2))}`

  const [domainName = '', ...domainTail] = domain.split('.')
  const maskedDomainName = domainName.length <= 2
    ? `${domainName[0] ?? ''}*`
    : `${domainName.slice(0, 2)}${'*'.repeat(Math.max(2, domainName.length - 2))}`

  return `${maskedLocal}@${[maskedDomainName, ...domainTail].filter(Boolean).join('.')}`
}
