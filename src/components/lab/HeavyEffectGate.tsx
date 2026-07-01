import { useState, useCallback, Suspense, type ComponentType } from 'react'

type HeavyEffectGateProps = {
  name: string
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
  fallback?: React.ReactNode
}

export function HeavyEffectGate({ name, loader, fallback }: HeavyEffectGateProps) {
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEffect = useCallback(() => {
    setLoading(true)
    setError(null)
    loader()
      .then((mod) => setComponent(() => mod.default))
      .catch((err) => setError(`Failed to load ${name}: ${err.message}`))
      .finally(() => setLoading(false))
  }, [loader, name])

  if (error) {
    return (
      <div className="heavy-gate heavy-gate--error">
        <p>{error}</p>
        <button type="button" className="heavy-gate__btn" onClick={loadEffect}>
          Retry
        </button>
      </div>
    )
  }

  if (Component) {
    return (
      <Suspense fallback={fallback ?? <div className="heavy-gate__loading">Loading…</div>}>
        <Component />
      </Suspense>
    )
  }

  return (
    <div className="heavy-gate">
      <p className="heavy-gate__label">
        This effect requires additional dependencies.
      </p>
      <button type="button" className="heavy-gate__btn" onClick={loadEffect} disabled={loading}>
        {loading ? 'Loading…' : `Load ${name}`}
      </button>
    </div>
  )
}
