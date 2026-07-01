import { useMemo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'

import './OrbitImages.css'

function generateEllipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`
}

function generateCirclePath(cx: number, cy: number, r: number) {
  return generateEllipsePath(cx, cy, r, r)
}

type OrbitItemProps = {
  item: ReactNode
  index: number
  totalItems: number
  path: string
  itemSize: number
  rotation: number
  progress: ReturnType<typeof useMotionValue<number>>
  fill: boolean
}

function OrbitItem({ item, index, totalItems, path, itemSize, rotation, progress, fill }: OrbitItemProps) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0

  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100
    return `${offset}%`
  })

  return (
    <motion.div
      className="orbit-item"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance,
      }}
    >
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  )
}

type OrbitImagesProps = {
  images?: string[]
  altPrefix?: string
  shape?: 'ellipse' | 'circle' | 'square' | 'rectangle' | 'triangle' | 'star' | 'heart' | 'infinity' | 'wave' | 'custom'
  customPath?: string
  baseWidth?: number
  radiusX?: number
  radiusY?: number
  radius?: number
  starPoints?: number
  starInnerRatio?: number
  rotation?: number
  duration?: number
  itemSize?: number
  direction?: 'normal' | 'reverse'
  fill?: boolean
  width?: number | string
  height?: number | string
  className?: string
  showPath?: boolean
  pathColor?: string
  pathWidth?: number
  easing?: string
  paused?: boolean
  centerContent?: ReactNode
  responsive?: boolean
}

export function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  shape = 'ellipse',
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(255,255,255,0.08)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false,
}: OrbitImagesProps) {
  void starPoints; void starInnerRatio
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)
  const reducedMotion = useReducedMotion()

  const designCenterX = baseWidth / 2
  const designCenterY = baseWidth / 2

  const path = useMemo(() => {
    switch (shape) {
      case 'circle':
        return generateCirclePath(designCenterX, designCenterY, radius)
      case 'ellipse':
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY)
      case 'square':
        return generateCirclePath(designCenterX, designCenterY, radius)
      case 'rectangle':
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY)
      case 'custom':
        return customPath || generateCirclePath(designCenterX, designCenterY, radius)
      default:
        return generateEllipsePath(designCenterX, designCenterY, radiusX, radiusY)
    }
  }, [shape, customPath, designCenterX, designCenterY, radiusX, radiusY, radius])

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return
    const updateScale = () => {
      if (!containerRef.current) return
      setScale(containerRef.current.clientWidth / baseWidth)
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [responsive, baseWidth])

  const progress = useMotionValue(0)

  useEffect(() => {
    if (paused || reducedMotion) return
    const controls = animate(progress, direction === 'reverse' ? -100 : 100, {
      duration,
      ease: easing as 'linear' | 'easeIn' | 'easeOut' | 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    })
    return () => controls.stop()
  }, [progress, duration, easing, direction, paused, reducedMotion])

  const containerWidth = responsive ? '100%' : (typeof width === 'number' ? width : '100%')
  const containerHeight = responsive ? 'auto' : (typeof width === 'number' ? width : 'auto')

  const items = images.map((src, index) => (
    <img
      key={src}
      src={src}
      alt={`${altPrefix} ${index + 1}`}
      draggable={false}
      className="orbit-image"
      loading="lazy"
    />
  ))

  return (
    <div
      ref={containerRef}
      className={`orbit-container ${className}`.trim()}
      style={{
        width: containerWidth,
        height: containerHeight,
        aspectRatio: responsive ? '1 / 1' : undefined,
      }}
      aria-hidden="true"
    >
      <div
        className={responsive ? 'orbit-scaling-container orbit-scaling-container--responsive' : 'orbit-scaling-container'}
        style={{
          width: responsive ? baseWidth : '100%',
          height: responsive ? baseWidth : '100%',
          transform: responsive && scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: responsive && scale === null ? 'hidden' : undefined,
        }}
      >
        <div
          className="orbit-rotation-wrapper"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {showPath && (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
              className="orbit-path-svg"
            >
              <path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth / (scale ?? 1)} />
            </svg>
          )}

          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              progress={progress}
              fill={fill}
            />
          ))}
        </div>
      </div>

      {centerContent && (
        <div className="orbit-center-content">
          {centerContent}
        </div>
      )}
    </div>
  )
}
