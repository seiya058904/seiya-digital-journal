import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'

/** Broadcast payloads may belong to another tab's temporary/remembered user.
 * Read through this tab's storage adapter, outside the SDK notification lock.
 */
export function observeSession(
  auth: SupabaseClient['auth'],
  publish: (session: Session | null, recovery: boolean) => void,
) {
  let disposed = false
  let revision = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = (event?: AuthChangeEvent, notifiedSession?: Session | null) => {
    const current = ++revision
    clearTimeout(timer)
    timer = setTimeout(() => {
      void auth.getSession().then(({ data, error }) => {
        if (disposed || current !== revision) return
        const session = error ? null : data.session
        publish(session, event === 'PASSWORD_RECOVERY' && Boolean(session)
          && session?.access_token === notifiedSession?.access_token)
      }).catch(() => {
        if (!disposed && current === revision) publish(null, false)
      })
    }, 0)
  }
  const { data: { subscription } } = auth.onAuthStateChange(schedule)
  schedule()
  return () => {
    disposed = true
    clearTimeout(timer)
    subscription.unsubscribe()
  }
}
