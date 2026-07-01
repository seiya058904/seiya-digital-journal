import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import './PillNav.css'

export type PillNavItem = {
  label: string
  href: string
  ariaLabel?: string
}

type PillNavProps = {
  logo: string
  logoAlt?: string
  items: readonly PillNavItem[]
  activeHref?: string
  className?: string
  ease?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
  initialLoadAnimation?: boolean
  onItemClick?: (item: PillNavItem) => void
}

type PillNavStyles = CSSProperties & {
  '--base': string
  '--pill-bg': string
  '--hover-text': string
  '--pill-text': string
}

export function PillNav({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  pillColor = '#120f17',
  hoveredPillTextColor = '#120f17',
  pillTextColor = baseColor,
  initialLoadAnimation = true,
  onItemClick,
}: PillNavProps) {
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([])
  const timelineRefs = useRef<Array<gsap.core.Timeline | null>>([])
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([])
  const logoImgRef = useRef<HTMLImageElement | null>(null)
  const logoTweenRef = useRef<gsap.core.Tween | null>(null)
  const navItemsRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const desktopMotion = window.matchMedia(
      '(min-width: 821px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    if (!desktopMotion.matches) return

    const timelines = timelineRefs.current
    const activeTweens = activeTweenRefs.current
    let cancelled = false
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement
        const { width, height } = pill.getBoundingClientRect()
        const radius = ((width * width) / 4 + height * height) / (2 * height)
        const diameter = Math.ceil(2 * radius) + 2
        const delta =
          Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1
        const originY = diameter - delta

        Object.assign(circle.style, {
          width: `${diameter}px`,
          height: `${diameter}px`,
          bottom: `-${delta}px`,
        })

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        })

        const label = pill.querySelector('.pill-label')
        const hoverLabel = pill.querySelector('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (hoverLabel) gsap.set(hoverLabel, { y: Math.ceil(height + 100), opacity: 0 })

        timelineRefs.current[index]?.kill()
        const timeline = gsap.timeline({ paused: true })
        timeline.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' },
          0,
        )
        if (label) {
          timeline.to(label, { y: -(height + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        }
        if (hoverLabel) {
          timeline.to(
            hoverLabel,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' },
            0,
          )
        }
        timelineRefs.current[index] = timeline
      })
    }

    layout()
    window.addEventListener('resize', layout)
    document.fonts?.ready.then(() => {
      if (!cancelled) layout()
    }).catch(() => {})

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { scale: 0 },
          { scale: 1, duration: 0.6, ease },
        )
      }
      if (navItemsRef.current) {
        gsap.fromTo(
          navItemsRef.current,
          { width: 0, overflow: 'hidden' },
          { width: 'auto', duration: 0.6, ease, clearProps: 'overflow' },
        )
      }
    }

    return () => {
      cancelled = true
      window.removeEventListener('resize', layout)
      timelines.forEach((timeline) => timeline?.kill())
      activeTweens.forEach((tween) => tween?.kill())
      logoTweenRef.current?.kill()
    }
  }, [ease, initialLoadAnimation, items])

  const handleEnter = (index: number) => {
    const timeline = timelineRefs.current[index]
    if (!timeline) return
    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = timeline.tweenTo(timeline.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    })
  }

  const handleLeave = (index: number) => {
    const timeline = timelineRefs.current[index]
    if (!timeline) return
    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    })
  }

  const handleLogoEnter = () => {
    if (!logoImgRef.current) return
    logoTweenRef.current?.kill()
    gsap.set(logoImgRef.current, { rotate: 0 })
    logoTweenRef.current = gsap.to(logoImgRef.current, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto',
    })
  }

  const styles: PillNavStyles = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor,
  }

  return (
    <div className="pill-nav-container">
      <nav
        className={`pill-nav ${className}`.trim()}
        aria-label="Primary navigation"
        style={styles}
      >
        <a
          className="pill-logo"
          href={items[0]?.href ?? '#home'}
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} />
        </a>

        <div className="pill-nav-items" ref={navItemsRef}>
          <ul className="pill-list">
            {items.map((item, index) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                  aria-label={item.ariaLabel ?? item.label}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                  onClick={() => onItemClick?.(item)}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  onFocus={() => handleEnter(index)}
                  onBlur={() => handleLeave(index)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(element) => {
                      circleRefs.current[index] = element
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}
