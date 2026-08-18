export const REMEMBER_ME_STORAGE_KEY = 'seiya-remember-me'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function setRememberMe(storage: StorageLike, remember: boolean) {
  if (remember) {
    storage.setItem(REMEMBER_ME_STORAGE_KEY, 'true')
  } else {
    storage.removeItem(REMEMBER_ME_STORAGE_KEY)
  }
}

function shouldRememberMe(storage: StorageLike) {
  try {
    return storage.getItem(REMEMBER_ME_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function createAuthStorage(storage: StorageLike): StorageLike {
  return {
    getItem: (key) => shouldRememberMe(storage) ? storage.getItem(key) : null,
    setItem: (key, value) => {
      if (shouldRememberMe(storage)) storage.setItem(key, value)
    },
    removeItem: (key) => storage.removeItem(key),
  }
}
