import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(-200), { stiffness: 140, damping: 28 })
  const y = useSpring(useMotionValue(-200), { stiffness: 140, damping: 28 })

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const unsubscribeX = x.on('change', (value) => {
      glowRef.current?.style.setProperty('--cursor-x', `${value}px`)
    })
    const unsubscribeY = y.on('change', (value) => {
      glowRef.current?.style.setProperty('--cursor-y', `${value}px`)
    })
    const handlePointer = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    window.addEventListener('pointermove', handlePointer, { passive: true })
    return () => {
      unsubscribeX()
      unsubscribeY()
      window.removeEventListener('pointermove', handlePointer)
    }
  }, [x, y])

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}
