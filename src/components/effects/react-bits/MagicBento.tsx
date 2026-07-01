import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import './MagicBento.css'

export type MagicBentoItem = {
  title: string
  description: string
  label: string
}

type MagicBentoProps = {
  items: readonly MagicBentoItem[]
  className?: string
  glowColor?: string
  spotlightRadius?: number
  particleCount?: number
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  textAutoHide?: boolean
  enableBorderGlow?: boolean
  enableSpotlight?: boolean
}

const MOBILE_BP = 768
const DEFAULT_GLOW = '132, 0, 255'
const DEFAULT_RADIUS = 300
const DEFAULT_PARTICLES = 12

function createParticleEl(x: number, y: number, color: string) {
  const el = document.createElement('div')
  el.className = 'particle'
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= MOBILE_BP)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

/* ── ParticleCard ────────────────────────────── */
type ParticleCardProps = {
  children: React.ReactNode
  className?: string
  disableAnimations?: boolean
  style?: CSSProperties
  particleCount?: number
  glowColor?: string
  enableTilt?: boolean
  clickEffect?: boolean
  enableMagnetism?: boolean
}

function ParticleCard({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLES,
  glowColor = DEFAULT_GLOW,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}: ParticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLElement[]>([])
  const timeoutsRef = useRef<number[]>([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef<HTMLElement[]>([])
  const particlesInitialized = useRef(false)

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return
    const el = cardRef.current

    /* init particles */
    if (!particlesInitialized.current) {
      const { width, height } = el.getBoundingClientRect()
      memoizedParticles.current = Array.from({ length: particleCount }, () =>
        createParticleEl(Math.random() * width, Math.random() * height, glowColor),
      )
      particlesInitialized.current = true
    }

    const onEnter = () => {
      isHoveredRef.current = true
      if (!particlesInitialized.current) return

      memoizedParticles.current.forEach((p, i) => {
        const t = window.setTimeout(() => {
          if (!isHoveredRef.current || !el.isConnected) return
          const clone = p.cloneNode(true) as HTMLElement
          el.appendChild(clone)
          particlesRef.current.push(clone)

          gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
          gsap.to(clone, {
            x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100,
            rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true,
          })
          gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true })
        }, i * 100)
        timeoutsRef.current.push(t)
      })

      if (enableTilt) {
        gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 })
      }
    }

    const onLeave = () => {
      isHoveredRef.current = false
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []

      particlesRef.current.forEach((p) => {
        gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.remove() })
      })
      particlesRef.current = []

      if (enableTilt) {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' })
      }
      if (enableMagnetism) {
        gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' })
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!enableTilt && !enableMagnetism) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const cx = rect.width / 2
      const cy = rect.height / 2

      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -10, rotateY: ((x - cx) / cx) * 10,
          duration: 0.1, ease: 'power2.out', transformPerspective: 1000,
        })
      }
      if (enableMagnetism) {
        gsap.to(el, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.3, ease: 'power2.out' })
      }
    }

    const onClick = (e: PointerEvent) => {
      if (!clickEffect) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const maxD = Math.max(Math.hypot(x, y), Math.hypot(x - rect.width, y), Math.hypot(x, y - rect.height), Math.hypot(x - rect.width, y - rect.height))
      const ripple = document.createElement('div')
      ripple.style.cssText = `
        position: absolute; width: ${maxD * 2}px; height: ${maxD * 2}px;
        border-radius: 50%; pointer-events: none; z-index: 1000;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxD}px; top: ${y - maxD}px;
      `
      el.appendChild(ripple)
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() })
    }

    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('click', onClick)

    return () => {
      isHoveredRef.current = false
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('click', onClick)
      timeoutsRef.current.forEach(clearTimeout)
      particlesRef.current.forEach((p) => p.remove())
      particlesRef.current = []
    }
  }, [disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor, particleCount])

  return (
    <div ref={cardRef} className={`${className} particle-container`} style={{ ...style, position: 'relative', overflow: 'hidden' } as CSSProperties}>
      {children}
    </div>
  )
}

/* ── GlobalSpotlight ─────────────────────────── */
function GlobalSpotlight({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_RADIUS,
  glowColor = DEFAULT_GLOW,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>
  disableAnimations?: boolean
  enabled?: boolean
  spotlightRadius?: number
  glowColor?: string
}) {
  const spotlightRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disableAnimations || !gridRef.current || !enabled) return
    const grid = gridRef.current

    const spotlight = document.createElement('div')
    spotlight.className = 'global-spotlight'
    spotlight.style.cssText = `
      position: fixed; width: 800px; height: 800px; border-radius: 50%;
      pointer-events: none; z-index: 200;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%, transparent 70%
      );
      opacity: 0; transform: translate(-50%, -50%); mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)
    spotlightRef.current = spotlight

    const section = grid.closest('.bento-section') || grid
    let inside = false

    const calcSpotlight = (r: number) => ({ proximity: r * 0.5, fadeDistance: r * 0.75 })

    const onMove = (e: PointerEvent) => {
      if (!spotlightRef.current) return
      const sRect = section.getBoundingClientRect()
      inside = e.clientX >= sRect.left && e.clientX <= sRect.right && e.clientY >= sRect.top && e.clientY <= sRect.bottom

      const cards = grid.querySelectorAll<HTMLElement>('.magic-bento-card')

      if (!inside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        cards.forEach((c) => c.style.setProperty('--glow-intensity', '0'))
        return
      }

      const { proximity, fadeDistance } = calcSpotlight(spotlightRadius)
      let minDist = Infinity

      cards.forEach((card) => {
        const r = card.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2)
        minDist = Math.min(minDist, d)

        const relativeX = ((e.clientX - r.left) / r.width) * 100
        const relativeY = ((e.clientY - r.top) / r.height) * 100
        card.style.setProperty('--glow-x', `${relativeX}%`)
        card.style.setProperty('--glow-y', `${relativeY}%`)

        let intensity = 0
        if (d <= proximity) intensity = 1
        else if (d <= fadeDistance) intensity = (fadeDistance - d) / (fadeDistance - proximity)
        card.style.setProperty('--glow-intensity', intensity.toString())
      })

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' })
      const op = minDist <= proximity ? 0.8 : minDist <= fadeDistance ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.8 : 0
      gsap.to(spotlightRef.current, { opacity: op, duration: op > 0 ? 0.2 : 0.5, ease: 'power2.out' })
    }

    const onLeaveDoc = () => {
      inside = false
      grid.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((c) => c.style.setProperty('--glow-intensity', '0'))
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('mouseleave', onLeaveDoc)

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeaveDoc)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [disableAnimations, enabled, glowColor, spotlightRadius, gridRef])

  return null
}

/* ── MagicBento ───────────────────────────────── */
export function MagicBento({
  items,
  className = '',
  glowColor = DEFAULT_GLOW,
  spotlightRadius = DEFAULT_RADIUS,
  particleCount = DEFAULT_PARTICLES,
  enableTilt = false,
  enableMagnetism = true,
  clickEffect = true,
  textAutoHide = true,
  enableBorderGlow = true,
  enableSpotlight = true,
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const disabled = isMobile

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={disabled}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div
        ref={gridRef}
        className={`card-grid bento-section ${className}`.trim()}
      >
        {items.map((item) => {
          const baseCls = [
            'magic-bento-card',
            textAutoHide ? 'magic-bento-card--text-autohide' : '',
            enableBorderGlow ? 'magic-bento-card--border-glow' : '',
          ].filter(Boolean).join(' ')

          if (enableTilt || enableMagnetism || clickEffect || particleCount > 0) {
            return (
              <ParticleCard
                key={item.title}
                className={baseCls}
                disableAnimations={disabled}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
                style={{ '--glow-color': glowColor } as CSSProperties}
              >
                <div className="magic-bento-card__header">
                  <div className="magic-bento-card__label">{item.label}</div>
                </div>
                <div className="magic-bento-card__content">
                  <h2 className="magic-bento-card__title">{item.title}</h2>
                  <p className="magic-bento-card__description">{item.description}</p>
                </div>
              </ParticleCard>
            )
          }

          return (
            <div key={item.title} className={`${baseCls} magic-bento-card--no-particles`}>
              <div className="magic-bento-card__header">
                <div className="magic-bento-card__label">{item.label}</div>
              </div>
              <div className="magic-bento-card__content">
                <h2 className="magic-bento-card__title">{item.title}</h2>
                <p className="magic-bento-card__description">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
