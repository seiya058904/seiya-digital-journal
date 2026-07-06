import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import './ImageTrail.css'

type Point = { x: number; y: number }

type ImageTrailProps = {
  items: readonly string[]
  className?: string
  threshold?: number
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

export function ImageTrail({ items, className = '', threshold = 80 }: ImageTrailProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canAnimate = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches
    if (!root || !canAnimate || items.length === 0) return

    const images = Array.from(root.querySelectorAll<HTMLElement>('.image-trail__item'))
    let current = 0
    let zIndex = 1
    let pointer: Point = { x: 0, y: 0 }
    let previous: Point = { x: 0, y: 0 }
    let cached: Point = { x: 0, y: 0 }
    let frame = 0

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      startLoop()
    }

    const render = () => {
      cached = {
        x: cached.x + (pointer.x - cached.x) * 0.1,
        y: cached.y + (pointer.y - cached.y) * 0.1,
      }

      if (distance(pointer, previous) > threshold) {
        current = (current + 1) % images.length
        zIndex += 1
        const image = images[current]
        const rect = image.getBoundingClientRect()

        gsap.killTweensOf(image)
        gsap
          .timeline()
          .fromTo(
            image,
            {
              opacity: 1,
              scale: 1,
              zIndex,
              x: cached.x - rect.width / 2,
              y: cached.y - rect.height / 2,
            },
            {
              x: pointer.x - rect.width / 2,
              y: pointer.y - rect.height / 2,
              duration: 0.4,
              ease: 'power1.out',
            },
          )
          .to(image, { opacity: 0, scale: 0.2, duration: 0.4, ease: 'power3.in' })

        previous = { ...pointer }
      }

      const catchUp = Math.abs(pointer.x - cached.x) + Math.abs(pointer.y - cached.y)
      if (catchUp > 0.01) {
        frame = requestAnimationFrame(render)
      } else {
        cached = { ...pointer }
        frame = 0
      }
    }

    function startLoop() {
      if (!frame) {
        frame = requestAnimationFrame(render)
      }
    }

    root.addEventListener('pointermove', onMove)
    return () => {
      root.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
      gsap.killTweensOf(images)
    }
  }, [items, threshold])

  return (
    <div className={`image-trail ${className}`.trim()} ref={rootRef}>
      {items.map((src) => (
        <div className="image-trail__item" key={src}>
          <img src={src} alt="" />
        </div>
      ))}
      <span>Move through the frame</span>
    </div>
  )
}
