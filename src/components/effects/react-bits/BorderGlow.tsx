import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PropsWithChildren,
} from 'react'

import './BorderGlow.css'

function parseHsl(value: string) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 40, s: 80, l: 80 }
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  }
}

function buildGlowVariables(glowColor: string, intensity: number) {
  const { h, s, l } = parseHsl(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  const variables: Record<string, string> = {}

  for (let index = 0; index < opacities.length; index += 1) {
    variables[`--glow-color${keys[index]}`] =
      `hsl(${base} / ${Math.min(opacities[index] * intensity, 100)}%)`
  }
  return variables
}

const gradientPositions = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
]
const gradientKeys = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
]
const colorMap = [0, 1, 2, 0, 1, 2, 1]

function buildGradientVariables(colors: string[]) {
  const variables: Record<string, string> = {}
  for (let index = 0; index < 7; index += 1) {
    const color = colors[Math.min(colorMap[index], colors.length - 1)]
    variables[gradientKeys[index]] =
      `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`
  }
  variables['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return variables
}

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3
const easeInCubic = (value: number) => value ** 3

type AnimateValueOptions = {
  start?: number
  end?: number
  duration?: number
  delay?: number
  ease?: (value: number) => number
  onUpdate: (value: number) => void
  onEnd?: () => void
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateValueOptions): () => void {
  const startedAt = performance.now() + delay
  let timeoutId = 0
  let rafId = 0
  let cancelled = false

  function tick() {
    if (cancelled) return
    const elapsed = performance.now() - startedAt
    const progress = Math.min(Math.max(elapsed / duration, 0), 1)
    onUpdate(start + (end - start) * ease(progress))
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else if (!cancelled) {
      onEnd?.()
    }
  }

  timeoutId = window.setTimeout(() => {
    if (cancelled) return
    rafId = requestAnimationFrame(tick)
  }, delay)

  return () => {
    if (cancelled) return
    cancelled = true
    clearTimeout(timeoutId)
    cancelAnimationFrame(rafId)
  }
}

type BorderGlowProps = PropsWithChildren<{
  className?: string
  edgeSensitivity?: number
  glowColor?: string
  backgroundColor?: string
  borderRadius?: number
  glowRadius?: number
  glowIntensity?: number
  coneSpread?: number
  animated?: boolean
  colors?: string[]
  fillOpacity?: number
}>

export function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const getCenter = useCallback((element: HTMLElement) => {
    const { width, height } = element.getBoundingClientRect()
    return [width / 2, height / 2] as const
  }, [])

  const getEdgeProximity = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenter(element)
      const deltaX = x - centerX
      const deltaY = y - centerY
      const scaleX = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX)
      const scaleY = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY)
      return Math.min(Math.max(1 / Math.min(scaleX, scaleY), 0), 1)
    },
    [getCenter],
  )

  const getCursorAngle = useCallback(
    (element: HTMLElement, x: number, y: number) => {
      const [centerX, centerY] = getCenter(element)
      const deltaX = x - centerX
      const deltaY = y - centerY
      if (deltaX === 0 && deltaY === 0) return 0
      let degrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90
      if (degrees < 0) degrees += 360
      return degrees
    },
    [getCenter],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        !window.matchMedia(
          '(hover: hover) and (pointer: fine)',
        ).matches
      ) {
        return
      }

      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const edge = getEdgeProximity(card, x, y)
      const angle = getCursorAngle(card, x, y)

      card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`)
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`)
    },
    [getCursorAngle, getEdgeProximity],
  )

  useEffect(() => {
    const card = cardRef.current
    if (
      !animated ||
      !card ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }
    const angleStart = 110
    const angleEnd = 465
    card.classList.add('sweep-active')
    card.style.setProperty('--cursor-angle', `${angleStart}deg`)

    const cancelAnimations = [
      animateValue({
        duration: 500,
        onUpdate: (value) =>
          card.style.setProperty('--edge-proximity', `${value}`),
      }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (value) =>
          card.style.setProperty(
            '--cursor-angle',
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (value) =>
          card.style.setProperty(
            '--cursor-angle',
            `${(angleEnd - angleStart) * (value / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (value) =>
          card.style.setProperty('--edge-proximity', `${value}`),
        onEnd: () => card.classList.remove('sweep-active'),
      }),
    ]

    return () => {
      cancelAnimations.forEach((cancel) => cancel())
    }
  }, [animated])

  const style = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    ...buildGlowVariables(glowColor, glowIntensity),
    ...buildGradientVariables(colors),
  } as CSSProperties

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={style}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  )
}
