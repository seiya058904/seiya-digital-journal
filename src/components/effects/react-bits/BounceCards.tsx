import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import './BounceCards.css'

type BounceCardsProps = {
  images: readonly string[]
  className?: string
  containerWidth?: number
  containerHeight?: number
  animationDelay?: number
  animationStagger?: number
  easeType?: string
  transformStyles?: readonly string[]
  enableHover?: boolean
}

const defaultTransforms = [
  'rotate(10deg) translate(-170px)',
  'rotate(5deg) translate(-85px)',
  'rotate(-3deg)',
  'rotate(-10deg) translate(85px)',
  'rotate(2deg) translate(170px)',
]

function withoutRotation(transform: string) {
  return /rotate\([\s\S]*?\)/.test(transform)
    ? transform.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)')
    : `${transform === 'none' ? '' : transform} rotate(0deg)`.trim()
}

function pushedTransform(transform: string, offset: number) {
  const match = transform.match(/translate\(([-0-9.]+)px\)/)
  if (!match) return `${transform === 'none' ? '' : transform} translate(${offset}px)`.trim()
  return transform.replace(match[0], `translate(${Number(match[1]) + offset}px)`)
}

export function BounceCards({
  images,
  className = '',
  containerWidth = 400,
  containerHeight = 260,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = defaultTransforms,
  enableHover = true,
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reduced motion: cards are already at final state, skip entrance animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
        },
      )
    }, containerRef)
    return () => context.revert()
  }, [animationDelay, animationStagger, easeType])

  const moveCards = (hoveredIndex?: number) => {
    if (!enableHover || !containerRef.current) return
    const select = gsap.utils.selector(containerRef)

    images.forEach((_, index) => {
      const target = select(`.bounce-card--${index}`)
      const base = transformStyles[index] ?? 'none'
      const transform =
        hoveredIndex === undefined
          ? base
          : index === hoveredIndex
            ? withoutRotation(base)
            : pushedTransform(base, index < hoveredIndex ? -160 : 160)

      gsap.to(target, {
        transform,
        duration: 0.4,
        ease: 'back.out(1.4)',
        delay: hoveredIndex === undefined ? 0 : Math.abs(hoveredIndex - index) * 0.05,
        overwrite: 'auto',
      })
    })
  }

  return (
    <div
      className={`bounce-cards ${className}`.trim()}
      ref={containerRef}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((src, index) => (
        <div
          key={src}
          className={`bounce-card bounce-card--${index}`}
          style={{ transform: transformStyles[index] ?? 'none' }}
          onMouseEnter={() => moveCards(index)}
          onMouseLeave={() => moveCards()}
        >
          <img src={src} alt="" />
        </div>
      ))}
    </div>
  )
}
