import { normalizeApiError } from './interactions.ts'
import { readPublicEnv } from './env.ts'

export type ProfileRecord = {
  displayName: string
  avatarKey: string
  email: string
  memberSince: string
}

export type ProfileStats = {
  comments: number
  likes: number
}

export type ProfileResponse = {
  profile: ProfileRecord
  stats: ProfileStats
}

type ApiResult<T> =
  | { ok: true, data: T }
  | { ok: false, error: { code: string, message: string } }

type ProfileUpdateInput = {
  displayName: string
  avatarKey: string
}

export function parseProfileResponse(input: unknown): ProfileResponse {
  if (
    !input ||
    typeof input !== 'object' ||
    !('profile' in input) ||
    !('stats' in input)
  ) {
    throw new Error('Invalid profile response.')
  }

  const profile = (input as { profile: unknown }).profile
  const stats = (input as { stats: unknown }).stats

  if (
    !profile ||
    typeof profile !== 'object' ||
    typeof (profile as ProfileRecord).displayName !== 'string' ||
    typeof (profile as ProfileRecord).avatarKey !== 'string' ||
    typeof (profile as ProfileRecord).email !== 'string' ||
    typeof (profile as ProfileRecord).memberSince !== 'string' ||
    !stats ||
    typeof stats !== 'object' ||
    typeof (stats as ProfileStats).comments !== 'number' ||
    typeof (stats as ProfileStats).likes !== 'number'
  ) {
    throw new Error('Invalid profile response.')
  }

  return {
    profile: {
      displayName: (profile as ProfileRecord).displayName,
      avatarKey: (profile as ProfileRecord).avatarKey,
      email: (profile as ProfileRecord).email,
      memberSince: (profile as ProfileRecord).memberSince,
    },
    stats: {
      comments: (stats as ProfileStats).comments,
      likes: (stats as ProfileStats).likes,
    },
  }
}

export async function getProfileMe(accessToken: string): Promise<ApiResult<ProfileResponse>> {
  return requestProfile('/api/profile/me', {
    method: 'GET',
    accessToken,
  })
}

export async function updateProfileMe(
  accessToken: string,
  payload: ProfileUpdateInput,
): Promise<ApiResult<ProfileResponse>> {
  return requestProfile('/api/profile/me', {
    method: 'PATCH',
    accessToken,
    body: payload,
  })
}

async function requestProfile(
  path: string,
  options: {
    method: 'GET' | 'PATCH'
    accessToken: string
    body?: ProfileUpdateInput
  },
): Promise<ApiResult<ProfileResponse>> {
  const env = readPublicEnv()
  if (!env.isApiConfigured || !env.apiBaseUrl) {
    return {
      ok: false,
      error: {
        code: 'BACKEND_NOT_CONFIGURED',
        message: 'Backend is not configured.',
      },
    }
  }

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.accessToken}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const json = await response.json().catch(() => null)
    if (!response.ok) {
      return {
        ok: false,
        error: normalizeApiError(json),
      }
    }

    try {
      return {
        ok: true,
        data: parseProfileResponse((json as { data?: unknown })?.data),
      }
    } catch {
      return {
        ok: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'The backend returned an invalid profile response.',
        },
      }
    }
  } catch {
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the backend right now.',
      },
    }
  }
}
