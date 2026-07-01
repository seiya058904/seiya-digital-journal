import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import type { HTMLAttributes, PropsWithChildren } from 'react'

gsap.registerPlugin(ScrollTrigger)

const RM_QUERY = '(prefers-reduced-motion: reduce)'

type AnimatedContentProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    distance?: number
    direction?: 'vertical' | 'horizontal'
    reverse?: boolean
    duration?: number
    ease?: string
    initialOpacity?: number
    scale?: number
    threshold?: number
    delay?: number
  }
>

export function AnimatedContent({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  ...props
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Reduced motion: content is already visible, skip GSAP animation
    if (window.matchMedia(RM_QUERY).matches) return

    const context = gsap.context(() => {
      const axis = direction === 'horizontal' ? 'x' : 'y'
      const offset = (reverse ? -1 : 1) * distance

      gsap.fromTo(
        element,
        { [axis]: offset, scale, opacity: initialOpacity },
        {
          [axis]: 0,
          scale: 1,
          opacity: 1,
          duration,
          ease,
          delay,
          scrollTrigger: {
            trigger: element,
            start: `top ${(1 - threshold) * 100}%`,
            toggleActions: 'play reverse play reverse',
          },
        },
      )
    }, element)

    return () => context.revert()
  }, [delay, direction, distance, duration, ease, initialOpacity, reverse, scale, threshold])

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}
