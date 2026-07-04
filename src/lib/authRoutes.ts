export const HOME_ROUTE = '#/'
export const AUTH_ROUTE = '#/auth'
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
  window.sessionStorage.setItem(AUTH_RETURN_TARGET_KEY, nextTarget)
}

export function getAuthReturnTarget(): string {
  if (typeof window === 'undefined') return HOME_ROUTE
  return normalizeAuthReturnTarget(window.sessionStorage.getItem(AUTH_RETURN_TARGET_KEY))
}

export function consumeAuthReturnTarget(): string {
  if (typeof window === 'undefined') return HOME_ROUTE
  const target = getAuthReturnTarget()
  window.sessionStorage.removeItem(AUTH_RETURN_TARGET_KEY)
  return target
}

export function navigateToAuth(returnTarget = getCurrentInternalRoute()) {
  if (typeof window === 'undefined') return
  setAuthReturnTarget(returnTarget)
  window.location.hash = AUTH_ROUTE
}
