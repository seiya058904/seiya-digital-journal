import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from 'postprocessing'
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
// @ts-expect-error Three.js publishes runtime modules separately from its community type package.
import * as THREE from 'three'

import './GridScan.css'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanGlow;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

void main() {
  vec2 p = (2.0 * vUv * iResolution.xy - iResolution.xy) / iResolution.y;
  vec3 ray = normalize(vec3(p + uSkew, 1.7));
  float floorHit = (-0.34) / min(-0.001, ray.y);
  vec2 gridUv = vec2(ray.x * floorHit, ray.z * floorHit) / max(0.02, uGridScale);

  gridUv += vec2(
    sin(gridUv.y * 2.7 + iTime * 1.8),
    cos(gridUv.x * 2.3 - iTime * 1.6)
  ) * (0.08 * uLineJitter);

  vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
  float line = 1.0 - min(min(grid.x, grid.y) / max(0.2, uLineThickness), 1.0);
  float depthFade = exp(-max(0.0, floorHit) * 0.45);

  float duration = max(0.1, uScanDuration);
  float cycle = duration + max(0.0, uScanDelay);
  float phase = clamp((mod(iTime, cycle) - uScanDelay) / duration, 0.0, 1.0);
  phase = 1.0 - abs(phase * 2.0 - 1.0);
  float scanPosition = mix(-1.2, 3.2, phase);
  float scanDistance = abs(ray.z * floorHit - scanPosition);
  float scan = exp(-scanDistance * scanDistance / max(0.002, 0.08 * uScanGlow));
  float phaseFade = smoothstep(0.0, 0.08, phase) * (1.0 - smoothstep(0.92, 1.0, phase));

  vec3 gridColor = uLinesColor * line * depthFade;
  vec3 scanColor = uScanColor * scan * phaseFade * uScanOpacity;
  float alpha = clamp(line * depthFade + scan * phaseFade, 0.0, 0.82);
  gl_FragColor = vec4(gridColor + scanColor, alpha);
}
`

export type GridScanProps = {
  className?: string
  style?: CSSProperties
  sensitivity?: number
  lineThickness?: number
  linesColor?: string
  scanColor?: string
  scanOpacity?: number
  gridScale?: number
  lineJitter?: number
  enablePost?: boolean
  bloomIntensity?: number
  chromaticAberration?: number
  scanGlow?: number
  scanDuration?: number
  scanDelay?: number
}

export function GridScan({
  className = '',
  style,
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#2f4669',
  scanColor = '#73e6ff',
  scanOpacity = 0.5,
  gridScale = 0.1,
  lineJitter = 0.1,
  enablePost = true,
  bloomIntensity = 0.45,
  chromaticAberration = 0.001,
  scanGlow = 0.65,
  scanDuration = 2.4,
  scanDelay = 1.8,
}: GridScanProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        iResolution: { value: new THREE.Vector3() },
        iTime: { value: 0 },
        uSkew: { value: new THREE.Vector2() },
        uLineThickness: { value: lineThickness },
        uLinesColor: { value: new THREE.Color(linesColor).convertSRGBToLinear() },
        uScanColor: { value: new THREE.Color(scanColor).convertSRGBToLinear() },
        uGridScale: { value: gridScale },
        uLineJitter: { value: lineJitter },
        uScanOpacity: { value: scanOpacity },
        uScanGlow: { value: scanGlow },
        uScanDuration: { value: scanDuration },
        uScanDelay: { value: scanDelay },
      },
    })
    scene.add(new THREE.Mesh(geometry, material))

    let composer: EffectComposer | null = null
    if (enablePost) {
      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      const bloom = new BloomEffect({
        intensity: bloomIntensity,
        luminanceThreshold: 0,
        luminanceSmoothing: 0.25,
      })
      const chroma = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(chromaticAberration, chromaticAberration),
        radialModulation: true,
        modulationOffset: 0,
      })
      composer.addPass(new EffectPass(camera, bloom, chroma))
    }

    const pointerTarget = new THREE.Vector2()
    const pointerCurrent = new THREE.Vector2()
    const onMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      )
    }
    const onLeave = () => pointerTarget.set(0, 0)
    window.addEventListener('pointermove', onMove)
    document.addEventListener('mouseleave', onLeave)

    const resize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      renderer.setSize(width, height, false)
      composer?.setSize(width, height)
      material.uniforms.iResolution.value.set(width, height, renderer.getPixelRatio())
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    const clock = new THREE.Clock()
    let frame = 0
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.1)
      pointerCurrent.lerp(pointerTarget, Math.min(1, delta * (4 + sensitivity * 8)))
      material.uniforms.uSkew.value.set(
        pointerCurrent.x * sensitivity * 0.18,
        pointerCurrent.y * sensitivity * 0.12,
      )
      material.uniforms.iTime.value = clock.elapsedTime
      if (composer) composer.render(delta)
      else renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      composer?.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [
    bloomIntensity,
    chromaticAberration,
    enablePost,
    gridScale,
    lineJitter,
    lineThickness,
    linesColor,
    scanColor,
    scanDelay,
    scanDuration,
    scanGlow,
    scanOpacity,
    sensitivity,
  ])

  return <div ref={containerRef} className={`gridscan ${className}`.trim()} style={style} />
}
