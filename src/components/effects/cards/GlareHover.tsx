import type { CSSProperties, PropsWithChildren } from 'react'

type GlareHoverProps = PropsWithChildren<{
  className?: string
  glareColor?: string
  glareOpacity?: number
  disabled?: boolean
}>

export function GlareHover({
  children,
  className = '',
  glareColor = 'rgba(255 255 255 / 60%)',
  glareOpacity = 0.35,
  disabled = false,
}: GlareHoverProps) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (disabled || reducedMotion) {
    return <div className={`glare-hover ${className}`}>{children}</div>
  }

  const style = {
    '--glare-color': glareColor,
    '--glare-opacity': glareOpacity,
  } as CSSProperties

  return (
    <div className={`glare-hover ${className}`} style={style}>
      <div className="glare-hover__glare" aria-hidden="true" />
      {children}
    </div>
  )
}
