import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
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
}

type BentoStyle = CSSProperties & {
  '--magic-glow': string
  '--glow-x': string
  '--glow-y': string
}

export function MagicBento({
  items,
  className = '',
  glowColor = '86, 228, 255',
  spotlightRadius = 260,
  particleCount = 8,
  enableTilt = true,
  enableMagnetism = true,
}: MagicBentoProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canAnimate = window.matchMedia(
      '(min-width: 821px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches
    if (!root || !canAnimate) return

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.magic-bento-card'))
    const cleanup: Array<() => void> = []

    cards.forEach((card) => {
      const particles = Array.from(card.querySelectorAll<HTMLElement>('.magic-bento-particle'))

      const onEnter = () => {
        gsap.fromTo(
          particles,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.75,
            duration: 0.35,
            stagger: 0.04,
            ease: 'back.out(1.7)',
          },
        )
      }
      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`)
        card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`)
        card.style.setProperty('--glow-intensity', '1')

        gsap.to(card, {
          rotateX: enableTilt ? ((y - rect.height / 2) / rect.height) * -10 : 0,
          rotateY: enableTilt ? ((x - rect.width / 2) / rect.width) * 10 : 0,
          x: enableMagnetism ? (x - rect.width / 2) * 0.025 : 0,
          y: enableMagnetism ? (y - rect.height / 2) * 0.025 : 0,
          duration: 0.2,
          ease: 'power2.out',
          transformPerspective: 1000,
          overwrite: 'auto',
        })
      }
      const onLeave = () => {
        card.style.setProperty('--glow-intensity', '0')
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        })
        gsap.to(particles, { scale: 0, opacity: 0, duration: 0.25 })
      }

      card.addEventListener('pointerenter', onEnter)
      card.addEventListener('pointermove', onMove)
      card.addEventListener('pointerleave', onLeave)
      cleanup.push(() => {
        card.removeEventListener('pointerenter', onEnter)
        card.removeEventListener('pointermove', onMove)
        card.removeEventListener('pointerleave', onLeave)
      })
    })

    return () => {
      cleanup.forEach((remove) => remove())
      gsap.killTweensOf(cards)
    }
  }, [enableMagnetism, enableTilt, items])

  const style = {
    '--magic-glow': glowColor,
    '--glow-x': '50%',
    '--glow-y': '50%',
  } satisfies BentoStyle

  return (
    <div
      className={`magic-bento ${className}`.trim()}
      ref={rootRef}
      style={{ ...style, '--spotlight-radius': `${spotlightRadius}px` } as CSSProperties}
    >
      {items.map((item, index) => (
        <article className="magic-bento-card" key={item.title}>
          <span className="magic-bento-card__label">{item.label}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
          {Array.from({ length: particleCount }, (_, particle) => (
            <i
              className="magic-bento-particle"
              key={particle}
              style={{
                left: `${12 + ((particle * 37 + index * 13) % 76)}%`,
                top: `${10 + ((particle * 29 + index * 17) % 78)}%`,
              }}
            />
          ))}
        </article>
      ))}
    </div>
  )
}
