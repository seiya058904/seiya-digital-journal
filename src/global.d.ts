/* ── Static asset declarations ──────────────────── */
declare module '*.glb' {
  const src: string
  export default src
}

/* ── Three.js / meshline extended elements ─────── */
declare module 'meshline' {
  import type * as THREE from 'three'
  export class MeshLineGeometry extends THREE.BufferGeometry {
    setPoints(points: THREE.Vector3[] | Float32Array): void
  }
  export class MeshLineMaterial extends THREE.Material {
    constructor(parameters?: Record<string, unknown>)
  }
}

import type * as React from 'react'
declare global {
  namespace React {
    interface IntrinsicElements {
      meshLineGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>
      meshLineMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>
    }
  }
}
