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
}

const decimalPlaces = (value: number) => value.toString().split('.')[1]?.length ?? 0

export function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? to : from)
  const springValue = useSpring(motionValue, {
    damping: 20 + 40 / duration,
    stiffness: 100 / duration,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })
  const decimals = Math.max(decimalPlaces(from), decimalPlaces(to))

  const formatValue = useCallback(
    (value: number) => {
      const formatted = Intl.NumberFormat('en-US', {
        useGrouping: Boolean(separator),
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value)
      return separator ? formatted.replaceAll(',', separator) : formatted
    },
    [decimals, separator],
  )

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(direction === 'down' ? to : from)
  }, [direction, formatValue, from, to])

  useEffect(() => {
    if (!isInView || !startWhen) return
    const timeout = window.setTimeout(
      () => motionValue.set(direction === 'down' ? from : to),
      delay * 1000,
    )
    return () => window.clearTimeout(timeout)
  }, [delay, direction, from, isInView, motionValue, startWhen, to])

  useEffect(
    () =>
      springValue.on('change', (value) => {
        if (ref.current) ref.current.textContent = formatValue(value)
      }),
    [formatValue, springValue],
  )

  return <span className={className} ref={ref} />
}
