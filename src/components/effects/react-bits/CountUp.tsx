import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'

type CountUpProps = {
  to: number
  from?: number
  direction?: 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  startWhen?: boolean
  separator?: string
  onStart?: () => void
  onEnd?: () => void
}

function getDecimalPlaces(num: number) {
  const str = num.toString()
  if (str.includes('.')) {
    const decimals = str.split('.')[1]
    if (parseInt(decimals) !== 0) {
      return decimals.length
    }
  }
  return 0
}

export function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? to : from)

  const damping = 20 + 40 * (1 / duration)
  const stiffness = 100 * (1 / duration)

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  })

  const isInView = useInView(ref, { once: true, margin: '0px' })

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to))

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0
      const options: Intl.NumberFormatOptions = {
        useGrouping: Boolean(separator),
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      }
      const formatted = Intl.NumberFormat('en-US', options).format(latest)
      return separator ? formatted.replace(/,/g, separator) : formatted
    },
    [maxDecimals, separator],
  )

  // Store callbacks in refs to avoid re-triggering effects
  const onStartRef = useRef(onStart)
  onStartRef.current = onStart
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd
  const onEndFired = useRef(false)

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from)
    }
  }, [from, to, direction, formatValue])

  useEffect(() => {
    if (!isInView || !startWhen) return
    if (typeof onStartRef.current === 'function') onStartRef.current()
    onEndFired.current = false

    const timeoutId = window.setTimeout(() => {
      motionValue.set(direction === 'down' ? from : to)
    }, delay * 1000)

    return () => {
      window.clearTimeout(timeoutId)
    }
    // Only depends on the trigger conditions, not on callback identities
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, startWhen, motionValue, direction, from, to, delay])

  // Detect spring settling to fire onEnd
  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest)
      }
      const target = direction === 'down' ? from : to
      if (Math.abs(latest - target) < 0.01 && !onEndFired.current) {
        onEndFired.current = true
        if (typeof onEndRef.current === 'function') onEndRef.current()
      }
    })
    return () => unsubscribe()
  }, [springValue, formatValue, direction, from, to])

  return <span className={className} ref={ref} />
}
