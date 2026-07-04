import { normalizeApiError } from './interactions'
import { readPublicEnv } from './env'
import { getSupabaseClient } from './supabase'

type ApiResult<T> =
  | { ok: true, data: T }
  | { ok: false, error: { code: string, message: string } }

type CommentPayload = {
  targetType: string
  targetId: string
  body: string
}

export async function createComment(payload: CommentPayload): Promise<ApiResult<{
  id: string
  authorName: string
  body: string
  createdAt: string
}>> {
  const env = readPublicEnv()
  if (!env.isApiConfigured) {
    return {
      ok: false,
      error: {
        code: 'BACKEND_NOT_CONFIGURED',
        message: 'Backend is not configured.',
      },
    }
  }

  const client = getSupabaseClient()
  if (!client) {
    return {
      ok: false,
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Backend is not configured.',
      },
    }
  }

  const {
    data: { session },
  } = await client.auth.getSession()

  if (!session?.access_token) {
    return {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Sign in to publish this comment.',
      },
    }
  }

  try {
    const response = await fetch(`${env.apiBaseUrl}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    })

    const json = await response.json().catch(() => null)
    if (!response.ok) {
      return {
        ok: false,
        error: normalizeApiError(json),
      }
    }

    return json as ApiResult<{
      id: string
      authorName: string
      body: string
      createdAt: string
    }>
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
