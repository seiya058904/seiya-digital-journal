import { normalizeApiError } from './interactions'
import { readPublicEnv } from './env'
import { getSupabaseClient } from './supabase'

export type ApiResult<T> =
  | { ok: true, data: T }
  | { ok: false, error: { code: string, message: string } }

export type InteractionTarget = {
  targetType: string
  targetId: string
}

export type CommentRecord = {
  id: string
  authorName: string
  body: string
  createdAt: string
}

const NETWORK_ERROR = {
  code: 'NETWORK_ERROR',
  message: 'Unable to reach the backend right now.',
} as const

const NOT_CONFIGURED_ERROR = {
  code: 'BACKEND_NOT_CONFIGURED',
  message: 'Backend is not configured.',
} as const


function readApiBaseUrl(): string | null {
  const env = readPublicEnv()
  return env.isApiConfigured ? env.apiBaseUrl : null
}

type ApiJson = Parameters<typeof normalizeApiError>[0]

async function parseApiJson(response: Response): Promise<ApiJson> {
  return response.json().catch(() => null)
}

async function requestApi<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, init)
    const json = await parseApiJson(response)
    if (!response.ok) {
      return { ok: false, error: normalizeApiError(json) }
    }
    return json as ApiResult<T>
  } catch {
    return { ok: false, error: { ...NETWORK_ERROR } }
  }
}

/**
 * Performs an authenticated API request with the current Supabase session.
 * Returns a failed ApiResult (without performing the request) when the
 * backend or auth client is unavailable.
 */
async function requestAuthedApi<T>(
  unauthorizedMessage: string,
  buildRequest: (apiBaseUrl: string, accessToken: string) => { url: string, init: RequestInit },
): Promise<ApiResult<T>> {
  const apiBaseUrl = readApiBaseUrl()
  if (!apiBaseUrl) {
    return { ok: false, error: { ...NOT_CONFIGURED_ERROR } }
  }

  const client = getSupabaseClient()
  if (!client) {
    return { ok: false, error: { code: 'AUTH_NOT_CONFIGURED', message: 'Backend is not configured.' } }
  }

  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session?.access_token) {
    return { ok: false, error: { code: 'UNAUTHORIZED', message: unauthorizedMessage } }
  }

  const { url, init } = buildRequest(apiBaseUrl, session.access_token)
  return requestApi<T>(url, {
    ...init,
    headers: {
      ...init.headers,
      'Authorization': `Bearer ${session.access_token}`,
    },
  })
}


function targetQuery(target: InteractionTarget): string {
  return `targetType=${encodeURIComponent(target.targetType)}&targetId=${encodeURIComponent(target.targetId)}`
}

export async function listComments(target: InteractionTarget, limit: number): Promise<ApiResult<CommentRecord[]>> {
  const apiBaseUrl = readApiBaseUrl()
  if (!apiBaseUrl) {
    return { ok: false, error: { ...NOT_CONFIGURED_ERROR } }
  }

  return requestApi<CommentRecord[]>(`${apiBaseUrl}/api/comments?${targetQuery(target)}&limit=${limit}`)
}

export async function createComment(payload: {
  targetType: string
  targetId: string
  body: string
}): Promise<ApiResult<CommentRecord>> {
  return requestAuthedApi<CommentRecord>('Sign in to publish this comment.', apiBaseUrl => ({
    url: `${apiBaseUrl}/api/comments`,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  }))
}

export async function fetchLikeCount(target: InteractionTarget): Promise<ApiResult<number>> {
  const apiBaseUrl = readApiBaseUrl()
  if (!apiBaseUrl) {
    return { ok: false, error: { ...NOT_CONFIGURED_ERROR } }
  }

  const result = await requestApi<{ count: number }>(`${apiBaseUrl}/api/likes/count?${targetQuery(target)}`)
  if (!result.ok) return result
  return { ok: true, data: result.data.count }
}

export async function likeTarget(target: InteractionTarget): Promise<ApiResult<{ count: number }>> {
  const apiBaseUrl = readApiBaseUrl()
  if (!apiBaseUrl) return { ok: false, error: { ...NOT_CONFIGURED_ERROR } }

  return requestApi<{ count: number }>(`${apiBaseUrl}/api/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(target),
  })
}
