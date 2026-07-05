import {
  ARCHIVE_STEPPER_TARGET,
  validateCommentBody,
  validateInteractionTarget,
} from '../../src/lib/interactions'
import { isOriginAllowed, parseAllowedOrigins } from '../../src/worker/cors'

type Env = {
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ALLOWED_ORIGINS: string
}

type AuthenticatedUser = {
  id: string
  displayName: string
}

type CommentRow = {
  id: string
  author_name: string
  body: string
  created_at: string
}

type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

const MIN_COMMENT_INTERVAL_MS = 10_000
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = getCorsHeaders(origin, env.ALLOWED_ORIGINS)

    if (origin && !cors.allowed) {
      return json(
        { ok: false, error: { code: 'FORBIDDEN', message: 'Origin is not allowed.' } },
        403,
        cors.headers,
      )
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: cors.headers,
      })
    }

    const url = new URL(request.url)

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return json({ ok: true, data: { ok: true } }, 200, cors.headers)
      }

      if (request.method === 'GET' && url.pathname === '/api/comments') {
        const target = parseTarget(url.searchParams.get('targetType'), url.searchParams.get('targetId'))
        const limit = parseLimit(url.searchParams.get('limit'))
        const rows = await listComments(env, target, limit)
        return json({
          ok: true,
          data: rows.map((row) => ({
            id: row.id,
            authorName: row.author_name,
            body: row.body,
            createdAt: row.created_at,
          })),
        }, 200, cors.headers)
      }

      if (request.method === 'POST' && url.pathname === '/api/comments') {
        const user = await requireUser(request, env)
        const body = await readJsonBody(request)
        const target = parseTarget(body.targetType, body.targetId)
        const commentBody = parseCommentBody(body.body)

        await enforceCommentRateLimit(env, user.id)
        const comment = await createComment(env, user, target, commentBody)

        return json({
          ok: true,
          data: {
            id: comment.id,
            authorName: comment.author_name,
            body: comment.body,
            createdAt: comment.created_at,
          },
        }, 201, cors.headers)
      }

      if (request.method === 'DELETE' && url.pathname.startsWith('/api/comments/')) {
        const user = await requireUser(request, env)
        const commentId = url.pathname.replace('/api/comments/', '').trim()
        if (!commentId) {
          throw apiError('BAD_REQUEST', 'Comment id is required.', 400)
        }

        const deleted = await deleteComment(env, commentId, user.id)
        if (!deleted) {
          throw apiError('NOT_FOUND', 'Comment not found.', 404)
        }

        return json({ ok: true, data: null }, 200, cors.headers)
      }

      if (request.method === 'GET' && url.pathname === '/api/likes/count') {
        const target = parseTarget(url.searchParams.get('targetType'), url.searchParams.get('targetId'))
        const count = await getLikesCount(env, target)
        return json({ ok: true, data: { count } }, 200, cors.headers)
      }

      if (request.method === 'GET' && url.pathname === '/api/likes/me') {
        const user = await requireUser(request, env)
        const target = parseTarget(url.searchParams.get('targetType'), url.searchParams.get('targetId'))
        const liked = await getLikeState(env, user.id, target)
        return json({ ok: true, data: { liked } }, 200, cors.headers)
      }

      if (request.method === 'PUT' && url.pathname === '/api/likes') {
        const user = await requireUser(request, env)
        const body = await readJsonBody(request)
        const target = parseTarget(body.targetType, body.targetId)
        await ensureLike(env, user.id, target)
        return json({ ok: true, data: { liked: true } }, 200, cors.headers)
      }

      if (request.method === 'DELETE' && url.pathname === '/api/likes') {
        const user = await requireUser(request, env)
        const body = request.headers.get('Content-Type')?.includes('application/json')
          ? await readJsonBody(request)
          : {
              targetType: url.searchParams.get('targetType'),
              targetId: url.searchParams.get('targetId'),
            }
        const target = parseTarget(body.targetType, body.targetId)
        await deleteLike(env, user.id, target)
        return json({ ok: true, data: { liked: false } }, 200, cors.headers)
      }

      throw apiError('NOT_FOUND', 'Route not found.', 404)
    } catch (error) {
      return toErrorResponse(error, cors.headers)
    }
  },
}

function getCorsHeaders(origin: string | null, allowedOriginsValue: string) {
  const allowedOrigins = parseAllowedOrigins(allowedOriginsValue)
  const allowed = !origin || isOriginAllowed(origin, allowedOrigins)
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  })

  if (origin && allowed) {
    headers.set('Access-Control-Allow-Origin', origin)
  }

  return { allowed, headers }
}

function json(payload: unknown, status: number, headers?: Headers): Response {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  })
}

function apiError(code: ErrorCode, message: string, status: number) {
  return { code, message, status }
}

function toErrorResponse(error: unknown, headers: Headers): Response {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'status' in error
  ) {
    const known = error as { code: ErrorCode, message: string, status: number }
    return json({ ok: false, error: { code: known.code, message: known.message } }, known.status, headers)
  }

  return json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong.',
    },
  }, 500, headers)
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return await request.json()
  } catch {
    throw apiError('BAD_REQUEST', 'Request body must be valid JSON.', 400)
  }
}

function parseTarget(rawType: unknown, rawId: unknown) {
  const result = validateInteractionTarget(String(rawType ?? ''), String(rawId ?? ''))
  if (!result.ok) {
    throw apiError('BAD_REQUEST', 'Invalid target.', 400)
  }
  return result.value
}

function parseCommentBody(rawBody: unknown): string {
  const result = validateCommentBody(String(rawBody ?? ''))
  if (!result.ok) {
    throw apiError('BAD_REQUEST', 'Comment body must be between 1 and 500 characters.', 400)
  }
  return result.value
}

function parseLimit(rawLimit: string | null): number {
  const parsed = Number.parseInt(rawLimit ?? '', 10)
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT
  return Math.max(1, Math.min(MAX_LIMIT, parsed))
}

async function requireUser(request: Request, env: Env): Promise<AuthenticatedUser> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    throw apiError('UNAUTHORIZED', 'Authentication is required.', 401)
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': env.SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw apiError('UNAUTHORIZED', 'Authentication is required.', 401)
  }

  const user = await response.json() as {
    id: string
    user_metadata?: {
      display_name?: unknown
    }
  }

  return {
    id: user.id,
    displayName: typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name.trim() || 'User'
      : 'User',
  }
}

async function listComments(env: Env, target: typeof ARCHIVE_STEPPER_TARGET, limit: number): Promise<CommentRow[]> {
  const params = new URLSearchParams({
    select: 'id,author_name,body,created_at',
    target_type: `eq.${target.targetType}`,
    target_id: `eq.${target.targetId}`,
    status: 'eq.published',
    order: 'created_at.desc',
    limit: String(limit),
  })

  const response = await restFetch<CommentRow[]>(env, `/comments?${params.toString()}`)
  return response
}

async function createComment(
  env: Env,
  user: AuthenticatedUser,
  target: typeof ARCHIVE_STEPPER_TARGET,
  body: string,
): Promise<CommentRow> {
  const response = await restFetch<CommentRow[]>(env, '/comments', {
    method: 'POST',
    prefer: 'return=representation',
    body: {
      user_id: user.id,
      author_name: user.displayName,
      target_type: target.targetType,
      target_id: target.targetId,
      body,
      status: 'published',
    },
  })

  return response[0]
}

async function enforceCommentRateLimit(env: Env, userId: string): Promise<void> {
  const params = new URLSearchParams({
    select: 'created_at',
    user_id: `eq.${userId}`,
    order: 'created_at.desc',
    limit: '1',
  })

  const rows = await restFetch<Array<{ created_at: string }>>(env, `/comments?${params.toString()}`)
  const latest = rows[0]?.created_at
  if (!latest) return

  const delta = Date.now() - Date.parse(latest)
  if (delta < MIN_COMMENT_INTERVAL_MS) {
    throw apiError('RATE_LIMITED', 'Please wait a moment before posting again.', 429)
  }
}

async function deleteComment(env: Env, commentId: string, userId: string): Promise<boolean> {
  const params = new URLSearchParams({
    id: `eq.${commentId}`,
    user_id: `eq.${userId}`,
    select: 'id',
  })

  const deleted = await restFetch<Array<{ id: string }>>(env, `/comments?${params.toString()}`, {
    method: 'DELETE',
    prefer: 'return=representation',
  })

  return deleted.length > 0
}

async function getLikesCount(env: Env, target: typeof ARCHIVE_STEPPER_TARGET): Promise<number> {
  const params = new URLSearchParams({
    select: 'id',
    target_type: `eq.${target.targetType}`,
    target_id: `eq.${target.targetId}`,
  })

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/likes?${params.toString()}`, {
    method: 'HEAD',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  })

  if (!response.ok) {
    throw apiError('INTERNAL_ERROR', 'Unable to load likes.', 500)
  }

  const count = response.headers.get('Content-Range')?.split('/')[1]
  return count ? Number.parseInt(count, 10) || 0 : 0
}

async function getLikeState(
  env: Env,
  userId: string,
  target: typeof ARCHIVE_STEPPER_TARGET,
): Promise<boolean> {
  const params = new URLSearchParams({
    select: 'id',
    user_id: `eq.${userId}`,
    target_type: `eq.${target.targetType}`,
    target_id: `eq.${target.targetId}`,
    limit: '1',
  })

  const rows = await restFetch<Array<{ id: string }>>(env, `/likes?${params.toString()}`)
  return rows.length > 0
}

async function ensureLike(
  env: Env,
  userId: string,
  target: typeof ARCHIVE_STEPPER_TARGET,
): Promise<void> {
  if (await getLikeState(env, userId, target)) return

  await restFetch(env, '/likes?on_conflict=user_id,target_type,target_id', {
    method: 'POST',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    body: {
      user_id: userId,
      target_type: target.targetType,
      target_id: target.targetId,
    },
  })
}

async function deleteLike(
  env: Env,
  userId: string,
  target: typeof ARCHIVE_STEPPER_TARGET,
): Promise<void> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    target_type: `eq.${target.targetType}`,
    target_id: `eq.${target.targetId}`,
  })

  await restFetch(env, `/likes?${params.toString()}`, {
    method: 'DELETE',
    prefer: 'return=minimal',
  })
}

async function restFetch<T>(
  env: Env,
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'DELETE'
    prefer?: string
    body?: unknown
  },
): Promise<T> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options?.prefer ? { 'Prefer': options.prefer } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw apiError('INTERNAL_ERROR', 'The backend request failed.', 500)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : []) as T
}
