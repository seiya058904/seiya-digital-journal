import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { readPublicEnv } from '../lib/env'
import { getAuthRedirectUrl, getSupabaseClient } from '../lib/supabase'

type AuthActionSuccess = {
  ok: true
  message?: string
  requiresEmailConfirmation?: boolean
}

type AuthActionFailure = {
  ok: false
  message: string
}

type AuthActionResult = AuthActionSuccess | AuthActionFailure

type SignUpInput = {
  displayName: string
  email: string
  password: string
}

type SignInInput = {
  email: string
  password: string
}

type AuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  isConfigured: boolean
  backendMessage: string | null
  signUp: (input: SignUpInput) => Promise<AuthActionResult>
  signIn: (input: SignInInput) => Promise<AuthActionResult>
  signOut: () => Promise<AuthActionResult>
}

const authContext = createContext<AuthContextValue | null>(null)

function getDisplayableAuthError(fallback: string): AuthActionFailure {
  return {
    ok: false,
    message: fallback,
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const env = readPublicEnv()
  const client = getSupabaseClient()

  const [loading, setLoading] = useState(Boolean(client))
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }

    let cancelled = false

    client.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      if (cancelled) return
      setSession(null)
      setUser(null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [client])

  const signUp = async ({ displayName, email, password }: SignUpInput): Promise<AuthActionResult> => {
    if (!client) {
      return getDisplayableAuthError('Backend is not configured.')
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return getDisplayableAuthError('Unable to create account right now. Please try again.')
    }

    if (!data.session) {
      return {
        ok: true,
        requiresEmailConfirmation: true,
        message: 'Check your email to confirm your account.',
      }
    }

    return {
      ok: true,
      message: 'Account created.',
    }
  }

  const signIn = async ({ email, password }: SignInInput): Promise<AuthActionResult> => {
    if (!client) {
      return getDisplayableAuthError('Backend is not configured.')
    }

    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return getDisplayableAuthError('Unable to sign in with those credentials.')
    }

    return {
      ok: true,
      message: 'Signed in.',
    }
  }

  const signOut = async (): Promise<AuthActionResult> => {
    if (!client) {
      return getDisplayableAuthError('Backend is not configured.')
    }

    const { error } = await client.auth.signOut()
    if (error) {
      return getDisplayableAuthError('Unable to sign out right now.')
    }

    return {
      ok: true,
      message: 'Signed out.',
    }
  }

  return (
    <authContext.Provider
      value={{
        loading,
        session,
        user,
        isAuthenticated: Boolean(user),
        isConfigured: env.isSupabaseConfigured,
        backendMessage: env.isSupabaseConfigured ? null : 'Backend is not configured.',
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </authContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(authContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
