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

function createParticleEl(x: number, y: number, color: string) {
  const el = document.createElement('div')
  el.className = 'magic-bento-particle'
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgb(${color});
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 5;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BP)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function MagicBento({
  items,
  className = '',
  glowColor = '86, 228, 255',
  spotlightRadius = 260,
  particleCount = 8,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  textAutoHide = true,
  enableBorderGlow = true,
  enableSpotlight = true,
}: MagicBentoProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const disabled = isMobile

  /* ── Per-card particle + tilt + magnetism ─────── */
  useEffect(() => {
    const root = rootRef.current
    if (!root || disabled) return

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.magic-bento-card'))
    const particleInstances: Map<HTMLElement, HTMLElement[]> = new Map()
    const timeouts: number[] = []
    const cleanups: Array<() => void> = []

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect()
      const w = rect.width || 200
      const h = rect.height || 200

      /* ── Pre-create particles ── */
      const particles: HTMLElement[] = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticleEl(Math.random() * w, Math.random() * h, glowColor))
      }
      particleInstances.set(card, particles)

      let isHovering = false
      const onEnter = () => {
        isHovering = true
        card.classList.add('active')

        /* spawn & animate particles */
        particles.forEach((p, idx) => {
          const t = window.setTimeout(() => {
            if (!isHovering || !card.isConnected) return
            const clone = p.cloneNode(true) as HTMLElement
            card.appendChild(clone)
            gsap.fromTo(clone, { scale: 0, opacity: 0 }, {
              scale: 1, opacity: 0.8, duration: 0.3, ease: 'back.out(1.7)',
            })
            gsap.to(clone, {
              x: (Math.random() - 0.5) * 80,
              y: (Math.random() - 0.5) * 80,
              rotation: Math.random() * 360,
              duration: 2 + Math.random() * 2,
              ease: 'none', repeat: -1, yoyo: true,
            })
            gsap.to(clone, {
              opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true,
            })
          }, idx * 100)
          timeouts.push(t)
        })
      }

      const onMove = (e: PointerEvent) => {
        if (!isHovering) return
        const r = card.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top

        /* glow position */
        card.style.setProperty('--glow-x', `${(x / r.width) * 100}%`)
        card.style.setProperty('--glow-y', `${(y / r.height) * 100}%`)
        card.style.setProperty('--glow-intensity', '1')

        /* tilt */
        if (enableTilt) {
          gsap.to(card, {
            rotateX: ((y - r.height / 2) / r.height) * -10,
            rotateY: ((x - r.width / 2) / r.width) * 10,
            duration: 0.12, ease: 'power2.out', transformPerspective: 1000, overwrite: 'auto',
          })
        }

        /* magnetism */
        if (enableMagnetism) {
          gsap.to(card, {
            x: (x - r.width / 2) * 0.035,
            y: (y - r.height / 2) * 0.035,
            duration: 0.25, ease: 'power2.out', overwrite: 'auto',
          })
        }
      }

      const onLeave = () => {
        isHovering = false
        card.classList.remove('active')
        card.style.setProperty('--glow-intensity', '0')

        gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.35, ease: 'power2.out' })

        /* kill particles */
        const clones = card.querySelectorAll('.magic-bento-particle')
        clones.forEach((c) => {
          gsap.to(c, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => c.remove() })
        })
      }

      card.addEventListener('pointerenter', onEnter)
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)

      /* click ripple */
      if (clickEffect) {
        const onClick = (e: PointerEvent) => {
          const r = card.getBoundingClientRect()
          const x = e.clientX - r.left
          const y = e.clientY - r.top
          const maxD = Math.max(
            Math.hypot(x, y),
            Math.hypot(x - r.width, y),
            Math.hypot(x, y - r.height),
            Math.hypot(x - r.width, y - r.height),
          )
          const ripple = document.createElement('div')
          ripple.className = 'magic-bento-ripple'
          ripple.style.cssText = `
            position: absolute;
            width: ${maxD * 2}px;
            height: ${maxD * 2}px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(${glowColor}, 0.35) 0%, rgba(${glowColor}, 0.15) 30%, transparent 70%);
            left: ${x - maxD}px;
            top: ${y - maxD}px;
            pointer-events: none;
            z-index: 10;
          `
          card.appendChild(ripple)
          gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
            scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out',
            onComplete: () => ripple.remove(),
          })
        }
        card.addEventListener('click', onClick)
        cleanups.push(() => card.removeEventListener('click', onClick))
      }

      cleanups.push(() => {
        card.removeEventListener('pointerenter', onEnter)
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
        timeouts.forEach(clearTimeout)
        const clones = card.querySelectorAll('.magic-bento-particle')
        clones.forEach((c) => c.remove())
        /* pre-created nodes not in DOM, just discard */
        gsap.killTweensOf(card)
      })
    })

    return () => { cleanups.forEach((fn) => fn()) }
  }, [disabled, enableTilt, enableMagnetism, clickEffect, glowColor, particleCount])

  /* ── GlobalSpotlight ──────────────────────────── */
  useEffect(() => {
    if (disabled || !enableSpotlight || !rootRef.current) return
    const root = rootRef.current

    const spotlight = document.createElement('div')
    spotlight.className = 'magic-bento-spotlight'
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.12) 0%,
        rgba(${glowColor}, 0.06) 15%,
        rgba(${glowColor}, 0.03) 25%,
        rgba(${glowColor}, 0.015) 40%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    document.body.appendChild(spotlight)

    const section = root.closest('.section') || root
    let inside = false

    const onMove = (e: PointerEvent) => {
      const sRect = section.getBoundingClientRect()
      inside =
        e.clientX >= sRect.left && e.clientX <= sRect.right &&
        e.clientY >= sRect.top && e.clientY <= sRect.bottom

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        return
      }

      const prox = spotlightRadius * 0.5
      const fadeD = spotlightRadius * 0.75
      let minDist = Infinity

      root.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => {
        const r = card.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2)
        minDist = Math.min(minDist, d)

        let intensity = 0
        if (d <= prox) intensity = 1
        else if (d <= fadeD) intensity = (fadeD - d) / (fadeD - prox)
        card.style.setProperty('--glow-intensity', intensity.toString())
      })

      gsap.to(spotlight, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' })

      const op = minDist <= prox ? 0.6 : minDist <= fadeD ? ((fadeD - minDist) / (fadeD - prox)) * 0.6 : 0
      gsap.to(spotlight, { opacity: op, duration: op > 0 ? 0.2 : 0.5, ease: 'power2.out' })
    }

    const onLeaveDoc = () => {
      inside = false
      root.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((c) =>
        c.style.setProperty('--glow-intensity', '0'),
      )
      gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: 'power2.out' })
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('mouseleave', onLeaveDoc)

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeaveDoc)
      spotlight.parentNode?.removeChild(spotlight)
    }
  }, [disabled, enableSpotlight, glowColor, spotlightRadius])

  const cls = [
    'magic-bento',
    textAutoHide ? 'magic-bento--text-autohide' : '',
    enableBorderGlow ? 'magic-bento--border-glow' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={rootRef}
      className={cls}
      style={{
        '--magic-glow': glowColor,
        '--spotlight-radius': `${spotlightRadius}px`,
      } as CSSProperties}
    >
      {items.map((item) => (
        <article className="magic-bento-card" key={item.title}>
          <div className="magic-bento-card__header">
            <div className="magic-bento-card__label">{item.label}</div>
          </div>
          <div className="magic-bento-card__content">
            <h2 className="magic-bento-card__title">{item.title}</h2>
            <p className="magic-bento-card__description">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
