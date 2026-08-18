import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { createAuthStorage, setRememberMe } from '../auth/authPersistence'
import { readPublicEnv } from './env'
import { buildBrowserSiteUrl } from './site'

let cachedClient: SupabaseClient | null | undefined
let browserAuthStorage: Storage | null | undefined

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

  const storage = getBrowserAuthStorage()

  cachedClient = createClient(env.supabaseUrl!, env.supabasePublishableKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      ...(storage ? { storage: createAuthStorage(storage) } : {}),
    },
  })

  return cachedClient
}

export function setRememberedAuthSession(remember: boolean) {
  const storage = getBrowserAuthStorage()
  if (storage) setRememberMe(storage, remember)
}

export function getAuthRedirectUrl(): string {
  return buildBrowserSiteUrl()
}
