import { createContext } from 'react'

export type AuthModalContextValue = {
  isOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

export const authModalContext = createContext<AuthModalContextValue | null>(null)
