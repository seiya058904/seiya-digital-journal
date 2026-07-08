import {
  ARCHIVE_STEPPER_TARGET,
  validateCommentBody,
  validateInteractionTarget,
} from '../../src/lib/interactions'
import {
  DEFAULT_PROFILE_AVATAR_KEY,
  extractExactCount,
  getBootstrapDisplayName,
  validateProfileAvatarKey,
  validateProfileDisplayName,
} from '../../src/lib/profile'
import { isOriginAllowed, parseAllowedOrigins } from '../../src/worker/cors'

type Env = {
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  ALLOWED_ORIGINS: string
}

type AuthenticatedUser = {
  id: string
  email: string
  createdAt: string
  metadataDisplayName: string
}

type CommentRow = {
  id: string
  author_name: string
  body: string
  created_at: string
}

type ProfileRow = {
  user_id: string
  display_name: string
  avatar_key: string
  created_at: string
  updated_at: string
}

type ProfileStats = {
  comments: number
  likes: number
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
        const profile = await getOrCreateProfile(env, user)
        const body = await readJsonBody(request)
        const target = parseTarget(body.targetType, body.targetId)
        const commentBody = parseCommentBody(body.body)

        await enforceCommentRateLimit(env, user.id)
        const comment = await createComment(env, user.id, profile.display_name, target, commentBody)

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

      if (request.method === 'GET' && url.pathname === '/api/profile/me') {
        const user = await requireUser(request, env)
        const profile = await getOrCreateProfile(env, user)
        const stats = await getProfileStats(env, user.id)
        return json({ ok: true, data: buildProfileResponse(user, profile, stats) }, 200, cors.headers)
      }

      if (request.method === 'PATCH' && url.pathname === '/api/profile/me') {
        const user = await requireUser(request, env)
        await getOrCreateProfile(env, user)
        const body = await readJsonBody(request)
        const updates = parseProfileUpdate(body)
        const profile = await updateProfile(env, user.id, updates)
        const stats = await getProfileStats(env, user.id)
        return json({ ok: true, data: buildProfileResponse(user, profile, stats) }, 200, cors.headers)
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
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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
  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    throw apiError('BAD_REQUEST', 'Request body must be valid JSON.', 400)
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw apiError('BAD_REQUEST', 'Request body must be a JSON object.', 400)
  }

  return parsed as Record<string, unknown>
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

function parseProfileUpdate(body: Record<string, unknown>) {
  const displayName = validateProfileDisplayName(String(body.displayName ?? ''))
  if (!displayName.ok) {
    throw apiError('BAD_REQUEST', 'Display name must be between 1 and 80 characters.', 400)
  }

  const avatarKey = validateProfileAvatarKey(String(body.avatarKey ?? ''))
  if (!avatarKey.ok) {
    throw apiError('BAD_REQUEST', 'Avatar key is invalid.', 400)
  }

  return {
    displayName: displayName.value,
    avatarKey: avatarKey.value,
  }
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
    email?: unknown
    created_at?: unknown
    user_metadata?: {
      display_name?: unknown
    }
  }

  return {
    id: user.id,
    email: typeof user.email === 'string' ? user.email : '',
    createdAt: typeof user.created_at === 'string' ? user.created_at : '',
    metadataDisplayName: getBootstrapDisplayName(user.user_metadata?.display_name),
  }
}

async function getOrCreateProfile(env: Env, user: AuthenticatedUser): Promise<ProfileRow> {
  const params = new URLSearchParams({
    select: 'user_id,display_name,avatar_key,created_at,updated_at',
    user_id: `eq.${user.id}`,
    limit: '1',
  })

  const existing = await restFetch<ProfileRow[]>(env, `/profiles?${params.toString()}`)
  if (existing[0]) return existing[0]

  await restFetch(env, '/profiles?on_conflict=user_id', {
    method: 'POST',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    body: {
      user_id: user.id,
      display_name: user.metadataDisplayName,
      avatar_key: DEFAULT_PROFILE_AVATAR_KEY,
    },
  })

  const rows = await restFetch<ProfileRow[]>(env, `/profiles?${params.toString()}`)
  if (rows[0]) return rows[0]

  throw apiError('INTERNAL_ERROR', 'Unable to load profile.', 500)
}

async function updateProfile(
  env: Env,
  userId: string,
  updates: {
    displayName: string
    avatarKey: string
  },
): Promise<ProfileRow> {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: 'user_id,display_name,avatar_key,created_at,updated_at',
  })

  const rows = await restFetch<ProfileRow[]>(env, `/profiles?${params.toString()}`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: {
      display_name: updates.displayName,
      avatar_key: updates.avatarKey,
      updated_at: new Date().toISOString(),
    },
  })

  if (!rows[0]) {
    throw apiError('NOT_FOUND', 'Profile not found.', 404)
  }

  return rows[0]
}

async function getProfileStats(env: Env, userId: string): Promise<ProfileStats> {
  const commentsParams = new URLSearchParams({
    select: 'id',
    user_id: `eq.${userId}`,
    status: 'eq.published',
  })
  const likesParams = new URLSearchParams({
    select: 'id',
    user_id: `eq.${userId}`,
  })

  const [comments, likes] = await Promise.all([
    getExactCount(env, `/comments?${commentsParams.toString()}`, 'Unable to load comment count.'),
    getExactCount(env, `/likes?${likesParams.toString()}`, 'Unable to load like count.'),
  ])

  return { comments, likes }
}

function buildProfileResponse(user: AuthenticatedUser, profile: ProfileRow, stats: ProfileStats) {
  return {
    profile: {
      displayName: profile.display_name,
      avatarKey: profile.avatar_key,
      email: user.email,
      memberSince: user.createdAt,
    },
    stats,
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
  userId: string,
  displayName: string,
  target: typeof ARCHIVE_STEPPER_TARGET,
  body: string,
): Promise<CommentRow> {
  const response = await restFetch<CommentRow[]>(env, '/comments', {
    method: 'POST',
    prefer: 'return=representation',
    body: {
      user_id: userId,
      author_name: displayName,
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

  return getExactCount(env, `/likes?${params.toString()}`, 'Unable to load likes.')
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
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
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

async function getExactCount(env: Env, path: string, errorMessage: string): Promise<number> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    method: 'HEAD',
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'count=exact',
    },
  })

  if (!response.ok) {
    throw apiError('INTERNAL_ERROR', errorMessage, 500)
  }

  try {
    return extractExactCount(response.headers.get('Content-Range'))
  } catch {
    throw apiError('INTERNAL_ERROR', errorMessage, 500)
  }
}
