import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { GlareHover } from '../effects/react-bits/GlareHover'
import { Stack } from '../effects/react-bits/Stack'
import { TiltedCard } from '../effects/react-bits/TiltedCard'

import './ReactBitsDemo.css'

const base = import.meta.env.BASE_URL

const stackCards = [
  <img
    key="aurora"
    src={`${base}gallery/aurora.webp`}
    alt="Aurora journal artwork"
  />,
  <img
    key="horizon"
    src={`${base}gallery/horizon.webp`}
    alt="Horizon journal artwork"
  />,
  <img
    key="geometry"
    src={`${base}gallery/geometry.webp`}
    alt="Geometry journal artwork"
  />,
]

type ReactBitsDemoProps = {
  effectId: string
}

export function ReactBitsDemo({ effectId }: ReactBitsDemoProps) {
  switch (effectId) {
    case 'glare-hover':
      return (
        <GlareHover
          width="100%"
          height="11rem"
          background="linear-gradient(135deg, #111a33, #080b17)"
          borderColor="rgba(145, 196, 255, 0.28)"
          borderRadius="16px"
          glareColor="#ffffff"
          glareOpacity={0.35}
          glareAngle={-35}
        >
          <div className="rb-demo-copy">
            <span>05 / React Bits</span>
            <strong>Move across the light.</strong>
          </div>
        </GlareHover>
      )

    case 'border-glow':
      return (
        <BorderGlow
          className="rb-demo-border"
          backgroundColor="#080b17"
          borderRadius={16}
          glowRadius={24}
          animated
        >
          <div className="rb-demo-copy">
            <span>02 / React Bits</span>
            <strong>Follow the edge.</strong>
          </div>
        </BorderGlow>
      )

    case 'tilted-card':
      return (
        <TiltedCard
          imageSrc={`${base}gallery/reflection.webp`}
          altText="Reflection journal artwork"
          captionText="TiltedCard / desktop pointer"
          containerHeight="13rem"
          imageHeight="12rem"
          imageWidth="min(100%, 18rem)"
          rotateAmplitude={10}
          scaleOnHover={1.04}
          showMobileWarning={false}
        />
      )

    case 'stack':
      return (
        <div className="rb-demo-stack">
          <Stack
            cards={stackCards}
            randomRotation
            sensitivity={110}
            sendToBackOnClick
            mobileClickOnly
          />
        </div>
      )

    default:
      return null
  }
}
