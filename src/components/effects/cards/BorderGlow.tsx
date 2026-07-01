import { useReducedMotion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import type { CSSProperties, PropsWithChildren } from 'react'

type BorderGlowProps = PropsWithChildren<{
  className?: string
  disabled?: boolean
}>

const DEFAULT_COLORS = ['#56e4ff', '#8c75ff', '#ed6dff'] as const

export function BorderGlow({
  children,
  className = '',
  disabled = false,
}: BorderGlowProps) {
  const reducedMotion = useReducedMotion()
  const glowRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || disabled) return
      const glow = glowRef.current
      if (!glow) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const xPercent = (x / rect.width) * 100
      const yPercent = (y / rect.height) * 100

      glow.style.setProperty('--glow-x', `${xPercent}%`)
      glow.style.setProperty('--glow-y', `${yPercent}%`)
    },
    [reducedMotion, disabled],
  )

  const style = {
    '--glow-color-1': DEFAULT_COLORS[0],
    '--glow-color-2': DEFAULT_COLORS[1],
    '--glow-color-3': DEFAULT_COLORS[2],
  } as CSSProperties

  return (
    <div
      className={`border-glow ${className}`}
      onPointerMove={handlePointerMove}
      style={style}
    >
      <div
        ref={glowRef}
        className="border-glow__glow"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}
