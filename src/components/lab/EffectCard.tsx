import type { EffectMeta } from '../../data/effects'

type EffectCardProps = EffectMeta & {
  children?: React.ReactNode
}

const statusColors: Record<string, string> = {
  core: 'var(--color-cyan)',
  ready: 'var(--color-violet)',
  experimental: 'var(--color-gold)',
  heavy: 'var(--color-magenta)',
}

const depsColors: Record<string, string> = {
  none: 'var(--color-faint)',
  motion: 'var(--color-cyan)',
  gsap: 'var(--color-gold)',
  three: 'var(--color-magenta)',
}

export function EffectCard({
  name,
  type,
  deps,
  status,
  description,
  where,
  sourceFile,
  integrationStatus,
  homepageUsage,
  children,
}: EffectCardProps) {
  return (
    <article className="effect-card">
      <div className="effect-card__header">
        <h3 className="effect-card__name">{name}</h3>
        <div className="effect-card__badges">
          <span
            className="effect-card__badge"
            style={{ color: statusColors[status] }}
          >
            {status}
          </span>
          <span className="effect-card__badge effect-card__badge--type">
            {type}
          </span>
          <span
            className="effect-card__badge"
            style={{ color: depsColors[deps] }}
          >
            {deps}
          </span>
          <span
            className={`effect-card__badge effect-card__badge--${integrationStatus}`}
          >
            {integrationStatus === 'real-demo'
              ? 'real demo'
              : integrationStatus === 'planned'
                ? 'planned'
                : 'metadata only'}
          </span>
        </div>
      </div>
      <p className="effect-card__desc">{description}</p>
      <p className="effect-card__source">Source: {sourceFile}</p>
      <p className="effect-card__where">
        <span className="effect-card__where-label">Where:</span> {where}
      </p>
      <p className="effect-card__where">
        <span className="effect-card__where-label">Homepage:</span>{' '}
        {homepageUsage ? 'yes' : 'no'}
      </p>
      {children && <div className="effect-card__demo">{children}</div>}
    </article>
  )
}
