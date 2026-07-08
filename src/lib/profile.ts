export const PROFILE_AVATAR_KEYS = [
  'avatar-01',
  'avatar-02',
  'avatar-03',
  'avatar-04',
  'avatar-05',
  'avatar-06',
  'avatar-07',
  'avatar-08',
  'avatar-09',
  'avatar-10',
  'avatar-11',
  'avatar-12',
] as const

export type ProfileAvatarKey = (typeof PROFILE_AVATAR_KEYS)[number]

export const DEFAULT_PROFILE_AVATAR_KEY: ProfileAvatarKey = PROFILE_AVATAR_KEYS[0]

type ValidResult<T> = {
  ok: true
  value: T
}

type InvalidResult<TCode extends string> = {
  ok: false
  code: TCode
}

type DisplayNameValidationResult = ValidResult<string> | InvalidResult<'INVALID_DISPLAY_NAME'>
type AvatarKeyValidationResult = ValidResult<ProfileAvatarKey> | InvalidResult<'INVALID_AVATAR_KEY'>

export function validateProfileDisplayName(input: string): DisplayNameValidationResult {
  const value = input.trim()
  if (value.length < 1 || value.length > 80) {
    return { ok: false, code: 'INVALID_DISPLAY_NAME' }
  }
  return { ok: true, value }
}

export function validateProfileAvatarKey(input: string): AvatarKeyValidationResult {
  const value = input.trim() as ProfileAvatarKey
  if (!PROFILE_AVATAR_KEYS.includes(value)) {
    return { ok: false, code: 'INVALID_AVATAR_KEY' }
  }
  return { ok: true, value }
}

export function getBootstrapDisplayName(input: unknown): string {
  if (typeof input !== 'string') return 'User'
  return validateProfileDisplayName(input).ok ? input.trim() : 'User'
}

export function extractExactCount(contentRange: string | null): number {
  const total = contentRange?.split('/')[1]
  const count = total ? Number.parseInt(total, 10) : Number.NaN
  if (!Number.isFinite(count) || count < 0) {
    throw new Error('Unable to read count from Content-Range.')
  }
  return count
}
