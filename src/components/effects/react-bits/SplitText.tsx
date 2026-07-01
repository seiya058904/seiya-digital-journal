import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText as GsapSplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import type { ElementType } from 'react'

gsap.registerPlugin(ScrollTrigger, GsapSplitText)

const RM_QUERY = '(prefers-reduced-motion: reduce)'

type SplitTextProps = {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars'
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  tag?: 'p' | 'h2'
  textAlign?: 'left' | 'center' | 'right'
}

const defaultFrom = { opacity: 0, y: 40 }
const defaultTo = { opacity: 1, y: 0 }

export function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = defaultFrom,
  to = defaultTo,
  threshold = 0.1,
  tag = 'p',
  textAlign = 'left',
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Reduced motion: content is already visible, skip GSAP animation
    if (window.matchMedia(RM_QUERY).matches) return

    let split: GsapSplitText | null = null
    const context = gsap.context(() => {
      split = new GsapSplitText(element, {
        type: splitType,
        smartWrap: true,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
      })
      const targets = splitType.includes('chars')
        ? split.chars
        : splitType.includes('words')
          ? split.words
          : split.lines

      gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: element,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
        },
      })
    }, element)

    return () => {
      context.revert()
      split?.revert()
    }
  }, [delay, duration, ease, from, splitType, text, threshold, to])

  const Tag = tag as ElementType
  return (
    <Tag ref={ref} className={`split-parent ${className}`.trim()} style={{ textAlign }}>
      {text}
    </Tag>
  )
}
