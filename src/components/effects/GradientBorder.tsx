import type { PropsWithChildren } from 'react'

type GradientBorderProps = PropsWithChildren<{ className?: string }>

export function GradientBorder({ children, className = '' }: GradientBorderProps) {
  return <div className={`gradient-border ${className}`}>{children}</div>
}
