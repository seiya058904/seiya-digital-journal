export const REMEMBER_ME_STORAGE_KEY = 'seiya-remember-me'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type AuthStorage = StorageLike & { setRememberMe: (remember: boolean) => void }

export function createAuthStorage(storage: StorageLike | null): AuthStorage {
  // This adapter lives as long as the client. Temporary sessions must survive
  // every SDK read, including refresh and sign-out, but not a new page load.
  const memory = new Map<string, string | null>()
  const unpersisted = new Set<string>()
  let remember = false
  try {
    remember = storage?.getItem(REMEMBER_ME_STORAGE_KEY) === 'true'
  } catch { /* unavailable storage uses the page-local fallback */ }

  const removePersisted = (key: string) => {
    persist(key, null)
  }
  const persist = (key: string, value: string | null) => {
    try {
      if (value === null) storage?.removeItem(key)
      else storage?.setItem(key, value)
      unpersisted.delete(key)
    } catch {
      unpersisted.add(key)
    }
  }

  const adapter: AuthStorage = {
    getItem: (key) => {
      if (remember) {
        try {
          if (storage && !unpersisted.has(key)) memory.set(key, storage.getItem(key))
        } catch { /* use the last readable session */ }
      } else {
        // Remove sessions left by earlier remembered logins, never resurrect
        // them when the user later enables Remember me for another account.
        removePersisted(key)
      }
      if (!memory.has(key)) memory.set(key, null)
      return memory.get(key) ?? null
    },
    setItem: (key, value) => {
      memory.set(key, value)
      if (remember) persist(key, value)
      else removePersisted(key)
    },
    removeItem: (key) => {
      memory.set(key, null)
      removePersisted(key)
    },
    setRememberMe: (nextRemember) => {
      // Capture the latest persisted values before turning persistence off.
      if (remember) for (const key of memory.keys()) adapter.getItem(key)
      remember = nextRemember
      for (const [key, value] of memory) {
        if (remember) persist(key, value)
        else removePersisted(key)
      }
      persist(REMEMBER_ME_STORAGE_KEY, remember ? 'true' : null)
    },
  }
  return adapter
}
