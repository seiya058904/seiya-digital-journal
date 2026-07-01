import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Gallery } from '../components/sections/Gallery'
import { Hero } from '../components/sections/Hero'
import { Interests } from '../components/sections/Interests'
import { Journey } from '../components/sections/Journey'
import { Thoughts } from '../components/sections/Thoughts'
import { OrbitImages } from '../components/effects/react-bits/OrbitImages'
import { Stack } from '../components/effects/react-bits/Stack'
import { ScrollReveal } from '../components/motion/ScrollReveal'

const base = import.meta.env.BASE_URL

const stackImages = [
  `${base}visual-archive/editorial/editorial-001.webp`,
  `${base}visual-archive/editorial/editorial-006.webp`,
  `${base}visual-archive/editorial/editorial-007.webp`,
  `${base}visual-archive/memory/chongqing/chongqing-001.webp`,
  `${base}visual-archive/memory/chongqing/chongqing-004.webp`,
]

const orbitImages = [
  `${base}gallery/geometry.webp`,
  `${base}gallery/reflection.webp`,
  `${base}gallery/motion.webp`,
  `${base}gallery/horizon.webp`,
  `${base}gallery/aurora.webp`,
  `${base}gallery/future.webp`,
]

export function HomePage() {
  return (
    <main>
      <Hero />
      <About />

      {/* Current Stack — learning / making stack preview */}
      <section className="section section--stack">
        <div className="stack-layout">
          <ScrollReveal className="stack-info">
            <span className="stack-eyebrow">Current stack</span>
            <h2>Tools, languages &amp; directions I'm working with right now.</h2>
            <div className="stack-tags">
              {['English', 'React', 'TypeScript', 'Creative coding', 'Visual Archive'].map(
                (tag) => (
                  <span key={tag} className="stack-tag">{tag}</span>
                ),
              )}
            </div>
          </ScrollReveal>
          <ScrollReveal className="stack-visual" delay={0.15}>
            <Stack
              cards={stackImages.map((src, i) => (
                <img key={i} src={src} alt={`Stack preview ${i + 1}`} loading="lazy" />
              ))}
              randomRotation
              sensitivity={150}
              autoplay
              autoplayDelay={3500}
              pauseOnHover
            />
          </ScrollReveal>
        </div>
      </section>

      {/* OrbitImages — Signals around growth */}
      <section className="section section--signals">
        <div className="signals-layout">
          <ScrollReveal className="signals-info">
            <span className="signals-eyebrow">Four signals</span>
            <h2>Technology / Language / Making / Exploration</h2>
            <p>These are the directions I keep returning to. Not fixed paths, but orbits I choose to stay in.</p>
          </ScrollReveal>
          <ScrollReveal className="signals-visual" delay={0.12}>
            <OrbitImages
              images={orbitImages}
              shape="ellipse"
              radiusX={440}
              radiusY={130}
              rotation={-6}
              duration={35}
              itemSize={100}
              responsive
            />
          </ScrollReveal>
        </div>
      </section>

      <Interests />
      <Gallery />
      <Thoughts />
      <Journey />
      <Contact />
    </main>
  )
}
