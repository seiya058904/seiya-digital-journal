import { useEffect, useState, type ReactNode } from 'react'

export const PHONE_VIEWPORT_QUERY = '(max-width: 560px)'

type MatchMedia = (query: string) => Pick<MediaQueryList, 'matches'>

export function matchesPhoneViewport(
  matchMedia: MatchMedia | undefined = typeof window === 'undefined'
    ? undefined
    : window.matchMedia.bind(window),
) {
  return matchMedia?.(PHONE_VIEWPORT_QUERY).matches ?? false
}

function usePhoneViewport() {
  const [phone, setPhone] = useState(matchesPhoneViewport)

  useEffect(() => {
    const media = window.matchMedia(PHONE_VIEWPORT_QUERY)
    const update = () => setPhone(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return phone
}

export function DesktopOnly({ children }: { children: ReactNode }) {
  return usePhoneViewport() ? null : children
}

export function PhoneOnly({ children }: { children: ReactNode }) {
  return usePhoneViewport() ? children : null
}
