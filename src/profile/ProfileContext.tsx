import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

import { useAuth } from '../auth/AuthContext'
import {
  getProfileMe,
  updateProfileMe,
  type ProfileRecord,
  type ProfileStats,
} from '../lib/profileApi'
import { shouldApplyProfileMutation } from './profileState'

type ProfileUpdateInput = {
  displayName: string
  avatarKey: string
}

type ProfileUpdateResult =
  | { ok: true }
  | { ok: false, message: string }

type ProfileContextValue = {
  profile: ProfileRecord | null
  stats: ProfileStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateProfile: (input: ProfileUpdateInput) => Promise<ProfileUpdateResult>
}

const profileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, session, user } = useAuth()
  const accessToken = session?.access_token ?? null

  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const updateRequestIdRef = useRef(0)
  const activeUserIdRef = useRef<string | null>(user?.id ?? null)
  const tokenRef = useRef<string | null>(null)
  tokenRef.current = accessToken

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    activeUserIdRef.current = user?.id ?? null
    updateRequestIdRef.current += 1
  }, [user?.id])

  const clearState = useCallback(() => {
    setProfile(null)
    setStats(null)
    setLoading(false)
    setError(null)
  }, [])

  const loadProfile = useCallback(async (token: string, requestId: number) => {
    const result = await getProfileMe(token)
    if (!mountedRef.current || requestIdRef.current !== requestId) return

    if (!result.ok) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setProfile(result.data.profile)
    setStats(result.data.stats)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    if (!isAuthenticated || !accessToken || !user?.id) {
      clearState()
      return
    }

    setProfile(null)
    setStats(null)
    setError(null)
    setLoading(true)
    void loadProfile(accessToken, requestId)
  }, [accessToken, clearState, isAuthenticated, loadProfile, user?.id])

  const refresh = useCallback(async () => {
    if (!tokenRef.current) return
    requestIdRef.current += 1
    const requestId = requestIdRef.current
    setLoading(true)
    setError(null)
    await loadProfile(tokenRef.current, requestId)
  }, [loadProfile])

  const updateProfile = useCallback(async (input: ProfileUpdateInput): Promise<ProfileUpdateResult> => {
    const capturedUserId = activeUserIdRef.current
    if (!tokenRef.current || !capturedUserId) {
      return {
        ok: false,
        message: 'Sign in to edit your profile.',
      }
    }

    updateRequestIdRef.current += 1
    const capturedRequestId = updateRequestIdRef.current
    const result = await updateProfileMe(tokenRef.current, input)
    if (!shouldApplyProfileMutation({
      mounted: mountedRef.current,
      activeUserId: activeUserIdRef.current,
      capturedUserId,
      currentRequestId: updateRequestIdRef.current,
      capturedRequestId,
    })) {
      return {
        ok: false,
        message: 'Profile update was interrupted.',
      }
    }

    if (!result.ok) {
      return {
        ok: false,
        message: result.error.message,
      }
    }

    setProfile(result.data.profile)
    setStats(result.data.stats)
    setError(null)
    return { ok: true }
  }, [])

  return (
    <profileContext.Provider
      value={{
        profile,
        stats,
        loading,
        error,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </profileContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useProfile() {
  const context = useContext(profileContext)
  if (!context) {
    throw new Error('useProfile must be used inside ProfileProvider')
  }
  return context
}
