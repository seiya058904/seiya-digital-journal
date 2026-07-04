type EnvSource = Record<string, unknown>

export type PublicEnv = {
  supabaseUrl: string | null
  supabasePublishableKey: string | null
  apiBaseUrl: string | null
  isSupabaseConfigured: boolean
  isApiConfigured: boolean
}

function readStringEnv(source: EnvSource, key: string): string | null {
  const value = source[key]
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function readPublicEnv(source: EnvSource = import.meta.env): PublicEnv {
  const supabaseUrl = readStringEnv(source, 'VITE_SUPABASE_URL')
  const supabasePublishableKey = readStringEnv(source, 'VITE_SUPABASE_PUBLISHABLE_KEY')
  const apiBaseUrl = readStringEnv(source, 'VITE_API_BASE_URL')

  return {
    supabaseUrl,
    supabasePublishableKey,
    apiBaseUrl,
    isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
    isApiConfigured: Boolean(apiBaseUrl),
  }
}
