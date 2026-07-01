import { profile } from '../../data/profile'
import { ShinyText } from '../effects/text/ShinyText'
import { RotatingText } from '../effects/text/RotatingText'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const keywords = ['Student', 'Computer', 'English', 'Creative learning', 'Digital journal']

const rotateWords = ['Learning', 'Building', 'Recording', 'Becoming']

export function About() {
  return (
    <section id="about" className="section section--about">
      <Chapter number="02" title="About" />
      <div className="about-editorial">
        {/* Eyebrow */}
        <ScrollReveal className="about-eyebrow">
          <span>DIGITAL JOURNAL</span>
        </ScrollReveal>

        {/* Statement card */}
        <ScrollReveal className="about-statement-card">
          <h2>
            <ShinyText
              text={profile.about.statement}
              color="var(--color-text)"
              shineColor="#56e4ff"
              speed={0.6}
              spread={60}
              delay={2}
              pauseOnHover
            />
          </h2>
        </ScrollReveal>

        {/* Main editorial card */}
        <div className="about-editorial-grid">
          <ScrollReveal className="about-editorial-card" delay={0.1}>
            <p className="about-editorial-intro">{profile.about.intro}</p>
            <span className="about-editorial-cn">{profile.about.chinese}</span>
            <div className="about-keywords">
              {keywords.map((kw) => (
                <span key={kw} className="about-keyword-chip">{kw}</span>
              ))}
            </div>
          </ScrollReveal>

          {/* RotatingText module */}
          <ScrollReveal className="about-rhythm-card" delay={0.2}>
            <span className="about-rhythm-label">Current rhythm</span>
            <div className="about-rhythm-words">
              <RotatingText
                texts={rotateWords}
                rotationInterval={2800}
                staggerDuration={0.04}
                staggerFrom="first"
                transition={{ type: 'spring', damping: 26, stiffness: 180 }}
                mainClassName="about-rotating"
                splitBy="character"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
