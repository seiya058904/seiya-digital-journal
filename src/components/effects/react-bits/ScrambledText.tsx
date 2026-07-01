import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText as GsapSplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import './ScrambledText.css'

gsap.registerPlugin(GsapSplitText, ScrambleTextPlugin)

type ScrambledTextProps = {
  children: ReactNode
  as?: 'p' | 'span'
  className?: string
  style?: CSSProperties
  radius?: number
  duration?: number
  speed?: number
  scrambleChars?: string
}

export function ScrambledText({
  children,
  as: Tag = 'p',
  className = '',
  style,
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
}: ScrambledTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    const canAnimate = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches
    if (!element || !canAnimate) return

    let split: GsapSplitText | null = null
    const onMove = (event: PointerEvent) => {
      split?.chars.forEach((character) => {
        const characterElement = character as HTMLElement
        const rect = character.getBoundingClientRect()
        const distance = Math.hypot(
          event.clientX - (rect.left + rect.width / 2),
          event.clientY - (rect.top + rect.height / 2),
        )
        if (distance >= radius) return

        gsap.to(character, {
          overwrite: true,
          duration: duration * (1 - distance / radius),
          scrambleText: {
            text: characterElement.dataset.content ?? '',
            chars: scrambleChars,
            speed,
          },
          ease: 'none',
        })
      })
    }

    const context = gsap.context(() => {
      split = GsapSplitText.create(element, { type: 'chars', charsClass: 'scrambled-char' })
      split.chars.forEach((character) => {
        const characterElement = character as HTMLElement
        gsap.set(character, {
          display: 'inline-block',
          attr: { 'data-content': character.textContent ?? '' },
        })
        characterElement.dataset.content = character.textContent ?? ''
      })
    }, element)

    element.addEventListener('pointermove', onMove)
    return () => {
      element.removeEventListener('pointermove', onMove)
      context.revert()
      split?.revert()
    }
  }, [duration, radius, scrambleChars, speed])

  const props = {
    className: `scrambled-text ${className}`.trim(),
    style,
    children,
  }

  return Tag === 'span' ? (
    <span ref={(element) => { ref.current = element }} {...props} />
  ) : (
    <p ref={(element) => { ref.current = element }} {...props} />
  )
}
