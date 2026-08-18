import { useContext } from 'react'

import { authModalContext } from './authModalStore'

export function useAuthModal() {
  const context = useContext(authModalContext)
  if (!context) throw new Error('useAuthModal must be used inside AuthModalProvider')
  return context
}
