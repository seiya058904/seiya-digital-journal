import { useState } from 'react'

import { FileText, Code, Image, Settings } from 'lucide-react'

import profileLogo from '../../assets/profile-placeholder.svg'
import { MultiStepLoader } from '../effects/MultiStepLoader'
import { AnimatedContent } from '../effects/react-bits/AnimatedContent'
import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { BounceCards } from '../effects/react-bits/BounceCards'
import { CountUp } from '../effects/react-bits/CountUp'
import { GlareHover } from '../effects/react-bits/GlareHover'
import { GradientText } from '../effects/text/GradientText'
import { ImageTrail } from '../effects/react-bits/ImageTrail'
import { JournalStepperDemo } from '../effects/react-bits/JournalStepperDemo'
import { MagicBento } from '../effects/react-bits/MagicBento'
import { PillNav } from '../effects/react-bits/PillNav'
import { ProfileCard } from '../effects/react-bits/ProfileCard'
import { RotatingText } from '../effects/text/RotatingText'
import { ScrambledText } from '../effects/react-bits/ScrambledText'
import { ShinyText } from '../effects/text/ShinyText'
import { SplitText } from '../effects/react-bits/SplitText'
import { Stack } from '../effects/react-bits/Stack'
import { TiltedCard } from '../effects/react-bits/TiltedCard'
import { OrbitImages } from '../effects/react-bits/OrbitImages'
import { Folder } from '../effects/react-bits/Folder'
import { GlassIcons } from '../effects/react-bits/GlassIcons'
import { CardNav } from '../effects/react-bits/CardNav'
import { FlowingMenu } from '../effects/react-bits/FlowingMenu'
import { CursorGlow } from '../effects/CursorGlow'
import { GradientBorder } from '../effects/GradientBorder'
import { CardTilt } from '../effects/CardTilt'
import { ScrollReveal } from '../motion/ScrollReveal'
import { TextReveal } from '../motion/TextReveal'

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
  `${base}gallery/motion.webp`,
]

const magicDemoItems = [
  { title: 'Observe', description: 'Notice the quiet signal.', label: '01' },
  { title: 'Connect', description: 'Find the hidden relation.', label: '02' },
  { title: 'Make', description: 'Give the thought a form.', label: '03' },
]

const loaderStates = [
  { text: 'Observe the signal' },
  { text: 'Organize the fragments' },
  { text: 'Connect the ideas' },
  { text: 'Archive the moment' },
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

const orbitImages = demoImages.slice(0, 5)

const folderItems = [
  <span key="a">Image notes</span>,
  <span key="b">Written thoughts</span>,
  <span key="c">Project links</span>,
]

const glassIconItems = [
  { icon: <FileText size={18} />, color: 'blue', label: 'Docs' },
  { icon: <Code size={18} />, color: 'purple', label: 'Code' },
  { icon: <Image size={18} />, color: 'orange', label: 'Design' },
  { icon: <Settings size={18} />, color: 'green', label: 'Config' },
]

const cardNavItems = [
  {
    label: 'Journal',
    bgColor: 'rgba(20, 30, 60, 0.95)',
    textColor: '#e0e8ff',
    links: [
      { label: 'Thoughts', href: '#/' },
      { label: 'Gallery', href: '#/gallery' },
    ],
  },
  {
    label: 'Archive',
    bgColor: 'rgba(40, 20, 60, 0.95)',
    textColor: '#e0d0ff',
    links: [
      { label: 'Images', href: '#/archive/images' },
      { label: 'Notes', href: '#/archive/notes' },
    ],
  },
]

const flowingMenuItems = [
  { link: '#/', text: 'Journal', image: `${base}gallery/aurora.webp` },
  { link: '#/gallery', text: 'Gallery', image: `${base}gallery/horizon.webp` },
  { link: '#/archive', text: 'Archive', image: `${base}gallery/geometry.webp` },
]

function MultiStepLoaderDemo() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="rb-demo-loader">
      <button
        type="button"
        className="rb-demo-loader__button"
        onClick={() => setLoading(true)}
        aria-haspopup="dialog"
      >
        Start loader
      </button>
      <MultiStepLoader
        loadingStates={loaderStates}
        loading={loading}
        loop={false}
        onClose={() => setLoading(false)}
      />
    </div>
  )
}

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

    case 'gradient-text':
      return (
        <GradientText
          className="rb-demo-gradient"
          colors={['#56e4ff', '#a78bfa', '#f472b6', '#fbbf24', '#56e4ff']}
          animationSpeed={3}
          direction="diagonal"
        >
          Gradient text in motion.
        </GradientText>
      )

    case 'shiny-text':
      return (
        <ShinyText
          className="rb-demo-shiny"
          text="Move across the shine."
          speed={3}
          spread={80}
          shineColor="#e0e8ff"
          pauseOnHover
          yoyo
        />
      )

    case 'rotating-text':
      return (
        <div className="rb-demo-rotating-wrap">
          <span>I </span>
          <RotatingText
            texts={['think deeply', 'write clearly', 'build patiently']}
            rotationInterval={2600}
            staggerDuration={0.04}
            mainClassName="rb-demo-rotating"
          />
        </div>
      )

    case 'profile-card':
      return (
        <div className="rb-demo-profile-card">
          <ProfileCard
            avatarUrl={profileLogo}
            name="Seiya"
            title="Personal Journal"
            showUserInfo={false}
            behindGlowEnabled
            enableTilt
          />
        </div>
      )

    case 'multi-step-loader':
      return <MultiStepLoaderDemo />

    case 'stepper':
      return <JournalStepperDemo />

    case 'orbit-images':
      return (
        <OrbitImages
          images={orbitImages}
          shape="ellipse"
          rotation={-8}
          itemSize={64}
          duration={20}
          showPath
          pathColor="rgba(255,255,255,0.08)"
          width="100%"
          height="14rem"
        />
      )

    case 'folder':
      return (
        <div className="rb-demo-folder">
          <Folder color="#56e4ff" size={2} items={folderItems} />
        </div>
      )

    case 'glass-icons':
      return (
        <GlassIcons className="rb-demo-glass-icons" items={glassIconItems} />
      )

    case 'card-nav':
      return (
        <CardNav
          className="rb-demo-card-nav"
          items={cardNavItems}
          baseColor="rgba(5, 10, 24, 0.92)"
          menuColor="#9ca6bb"
        />
      )

    case 'flowing-menu':
      return (
        <FlowingMenu
          items={flowingMenuItems}
          speed={15}
          textColor="#e0e8ff"
          bgColor="#0a0d1a"
          marqueeBgColor="#fff"
          marqueeTextColor="#0a0d1a"
          borderColor="rgba(255,255,255,0.15)"
        />
      )

    case 'scroll-reveal':
      return (
        <ScrollReveal className="rb-demo-scroll-reveal" amount={0.3}>
          <div className="rb-demo-scroll-reveal__box">
            Scroll into view to reveal this content.
          </div>
        </ScrollReveal>
      )

    case 'text-reveal':
      return (
        <div className="rb-demo-text-reveal">
          <TextReveal>
            <span className="rb-demo-text-reveal__text">
              Words rise from the ground.
            </span>
          </TextReveal>
        </div>
      )

    case 'cursor-glow':
      return (
        <div className="rb-demo-cursor-glow">
          <CursorGlow />
          <span>Move your cursor here</span>
        </div>
      )

    case 'gradient-border':
      return (
        <GradientBorder className="rb-demo-gradient-border">
          <div className="rb-demo-gradient-border__inner">
            Gradient border wrapper
          </div>
        </GradientBorder>
      )

    case 'card-tilt':
      return (
        <CardTilt className="rb-demo-card-tilt" intensity={8}>
          <div className="rb-demo-card-tilt__inner">
            Tilt me
          </div>
        </CardTilt>
      )

    default:
      return null
  }
}
