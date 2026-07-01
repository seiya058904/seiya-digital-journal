import { MotionConfig } from 'framer-motion'

import { AuroraBackground } from './components/effects/AuroraBackground'
import { CursorGlow } from './components/effects/CursorGlow'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Gallery } from './components/sections/Gallery'
import { Hero } from './components/sections/Hero'
import { Interests } from './components/sections/Interests'
import { Journey } from './components/sections/Journey'
import { Thoughts } from './components/sections/Thoughts'
import { Header } from './components/ui/Header'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuroraBackground />
      <CursorGlow />
      <Header />
      <main>
        <Hero />
        <About />
        <Interests />
        <Gallery />
        <Thoughts />
        <Journey />
        <Contact />
      </main>
    </MotionConfig>
  )
}
