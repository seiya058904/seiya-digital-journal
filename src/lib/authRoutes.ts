export const HOME_ROUTE = '#/'
export const AUTH_ROUTE = '#/auth'
export const PROFILE_ROUTE = '#/profile'
export const AUTH_RETURN_TARGET_KEY = 'auth-return-target'

export function isInternalAuthRoute(target: string | null | undefined): target is string {
  return typeof target === 'string' && /^#\/(?:.*)?$/.test(target)
}

export function normalizeAuthReturnTarget(target: string | null | undefined): string {
  return isInternalAuthRoute(target) ? target : HOME_ROUTE
}

export function getCurrentInternalRoute(): string {
  if (typeof window === 'undefined') return HOME_ROUTE
  return normalizeAuthReturnTarget(window.location.hash)
}

export function setAuthReturnTarget(target: string) {
  if (typeof window === 'undefined') return
  const nextTarget = normalizeAuthReturnTarget(target)
  try {
    window.sessionStorage.setItem(AUTH_RETURN_TARGET_KEY, nextTarget)
  } catch {
    // storage unavailable — silently degrade
  }
}

export function getAuthReturnTarget(): string {
  if (typeof window === 'undefined') return HOME_ROUTE
  try {
    return normalizeAuthReturnTarget(window.sessionStorage.getItem(AUTH_RETURN_TARGET_KEY))
  } catch {
    return HOME_ROUTE
  }
}

export function consumeAuthReturnTarget(): string {
  if (typeof window === 'undefined') return HOME_ROUTE
  const target = getAuthReturnTarget()
  try {
    window.sessionStorage.removeItem(AUTH_RETURN_TARGET_KEY)
  } catch {
    // ignore removal failure — target already read
  }
  return target
}

export function clearAuthReturnTarget() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(AUTH_RETURN_TARGET_KEY)
  } catch {
    // ignore removal failure
  }
}

export function getPreSignOutRoute(route: string | null | undefined): string | null {
  const currentRoute = normalizeAuthReturnTarget(route)
  if (currentRoute === PROFILE_ROUTE || currentRoute === AUTH_ROUTE) {
    return HOME_ROUTE
  }
  return null
}

export function shouldRedirectProfileToAuth({
  loading,
  isAuthenticated,
  currentRoute,
}: {
  loading: boolean
  isAuthenticated: boolean
  currentRoute: string | null | undefined
}): boolean {
  if (loading || isAuthenticated) return false
  return normalizeAuthReturnTarget(currentRoute) === PROFILE_ROUTE
}

export function navigateToAuth(returnTarget = getCurrentInternalRoute()) {
  if (typeof window === 'undefined') return
  try {
    setAuthReturnTarget(returnTarget)
  } catch {
    // storage unavailable — proceed to auth route anyway
  }
  window.location.hash = AUTH_ROUTE
}
