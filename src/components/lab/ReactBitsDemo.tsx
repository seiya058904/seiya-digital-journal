import profileLogo from '../../assets/profile-placeholder.svg'
import { AnimatedContent } from '../effects/react-bits/AnimatedContent'
import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { BounceCards } from '../effects/react-bits/BounceCards'
import { CountUp } from '../effects/react-bits/CountUp'
import { DesktopGridScan } from '../effects/react-bits/DesktopGridScan'
import { GlareHover } from '../effects/react-bits/GlareHover'
import { ImageTrail } from '../effects/react-bits/ImageTrail'
import { MagicBento } from '../effects/react-bits/MagicBento'
import { PillNav } from '../effects/react-bits/PillNav'
import { ScrambledText } from '../effects/react-bits/ScrambledText'
import { SplitText } from '../effects/react-bits/SplitText'
import { Stack } from '../effects/react-bits/Stack'
import { TiltedCard } from '../effects/react-bits/TiltedCard'

import './ReactBitsDemo.css'

const base = import.meta.env.BASE_URL

const pillNavItems = [
  { label: 'Home', href: '#home' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Lab', href: '#/motion-lab' },
]

const demoImages = [
  `${base}gallery/aurora.webp`,
  `${base}gallery/horizon.webp`,
  `${base}gallery/geometry.webp`,
  `${base}gallery/reflection.webp`,
  `${base}gallery/night-study.webp`,
]

const magicDemoItems = [
  { title: 'Observe', description: 'Notice the quiet signal.', label: '01' },
  { title: 'Connect', description: 'Find the hidden relation.', label: '02' },
  { title: 'Make', description: 'Give the thought a form.', label: '03' },
]

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

    case 'pill-nav':
      return (
        <PillNav
          className="rb-demo-pill-nav"
          logo={profileLogo}
          logoAlt="Seiya home"
          items={pillNavItems}
          activeHref="#/motion-lab"
          baseColor="rgba(5, 10, 24, 0.92)"
          pillColor="rgba(25, 38, 68, 0.9)"
          hoveredPillTextColor="#f3f6ff"
          pillTextColor="#9ca6bb"
          initialLoadAnimation={false}
        />
      )

    case 'grid-scan':
      return (
        <div className="rb-demo-gridscan">
          <DesktopGridScan
            fallback={<div className="rb-demo-gridscan__fallback">Desktop visual core</div>}
            linesColor="#315b86"
            scanColor="#70e8ff"
            scanOpacity={0.58}
            gridScale={0.12}
          />
        </div>
      )

    case 'bounce-cards':
      return (
        <BounceCards
          className="rb-demo-bounce"
          images={demoImages.slice(0, 3)}
          containerWidth={360}
          containerHeight={210}
          transformStyles={[
            'rotate(-7deg) translate(-88px)',
            'rotate(2deg)',
            'rotate(7deg) translate(88px)',
          ]}
        />
      )

    case 'image-trail':
      return <ImageTrail items={demoImages} />

    case 'magic-bento':
      return (
        <MagicBento
          className="rb-demo-bento"
          items={magicDemoItems}
          particleCount={5}
          glowColor="140, 117, 255"
        />
      )

    case 'scrambled-text':
      return (
        <ScrambledText className="rb-demo-scrambled" radius={90}>
          Move close. Meaning rearranges itself.
        </ScrambledText>
      )

    case 'split-text':
      return (
        <SplitText
          className="rb-demo-split"
          text="Every thought arrives in pieces."
          splitType="words"
          delay={90}
          duration={0.8}
          threshold={0}
        />
      )

    case 'animated-content':
      return (
        <AnimatedContent
          className="rb-demo-animated"
          direction="horizontal"
          distance={70}
          threshold={0}
        >
          Content enters with intention.
        </AnimatedContent>
      )

    case 'count-up':
      return (
        <div className="rb-demo-count">
          <CountUp from={0} to={2026} duration={1.4} separator="," />
          <span>still becoming</span>
        </div>
      )

    default:
      return null
  }
}
