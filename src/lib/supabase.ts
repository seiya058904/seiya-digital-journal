import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { readPublicEnv } from './env'
import { buildBrowserSiteUrl } from './site'

let cachedClient: SupabaseClient | null | undefined

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient

  const env = readPublicEnv()
  if (!env.isSupabaseConfigured) {
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient(env.supabaseUrl!, env.supabasePublishableKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return cachedClient
}

export function getAuthRedirectUrl(): string {
  return `${buildBrowserSiteUrl()}#/auth`
}
