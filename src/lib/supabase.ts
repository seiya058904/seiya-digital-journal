import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { createAuthStorage, type AuthStorage } from '../auth/authPersistence'
import { readPublicEnv } from './env'
import { buildBrowserSiteUrl } from './site'

let cachedClient: SupabaseClient | null | undefined
let browserAuthStorage: Storage | null | undefined
let authStorage: AuthStorage | undefined

function getBrowserAuthStorage() {
  if (browserAuthStorage !== undefined) return browserAuthStorage
  try {
    browserAuthStorage = typeof window === 'undefined' ? null : window.localStorage
  } catch {
    browserAuthStorage = null
  }
  return browserAuthStorage
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient

  const env = readPublicEnv()
  if (!env.isSupabaseConfigured) {
    cachedClient = null
    return cachedClient
  }

  authStorage ??= createAuthStorage(getBrowserAuthStorage())

  cachedClient = createClient(env.supabaseUrl!, env.supabasePublishableKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: authStorage,
    },
  })

  return cachedClient
}

export function setRememberedAuthSession(remember: boolean) {
  authStorage ??= createAuthStorage(getBrowserAuthStorage())
  authStorage.setRememberMe(remember)
}

export function getAuthRedirectUrl(): string {
  return buildBrowserSiteUrl()
}
