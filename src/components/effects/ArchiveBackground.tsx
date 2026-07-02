import Silk from './react-bits/Silk'
import './ArchiveBackground.css'

export function ArchiveBackground({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={`archive-bg${hidden ? ' archive-bg--hidden' : ''}`} aria-hidden="true">
      <Silk
        speed={4}
        scale={2}
        color="#524499"
        noiseIntensity={1.5}
        rotation={0.5}
      />
    </div>
  )
}
