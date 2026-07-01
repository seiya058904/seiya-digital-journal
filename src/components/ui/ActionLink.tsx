import { ArrowUpRight } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type ActionLinkProps = PropsWithChildren<{
  href: string
  className?: string
}>

export function ActionLink({ href, className = '', children }: ActionLinkProps) {
  return (
    <a className={`action-link ${className}`} href={href}>
      <span className="action-link__content">{children}</span>
      <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.7} />
    </a>
  )
}
