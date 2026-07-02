import { profile } from '../../data/profile'
import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { ScrambledText } from '../effects/react-bits/ScrambledText'
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
        <ScrollReveal className="about-eyebrow">
          <span>DIGITAL JOURNAL</span>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <BorderGlow
            className="about-main-card"
            glowColor="200 80 70"
            backgroundColor="#0a0f1e"
            borderRadius={24}
            glowRadius={40}
            colors={['#38bdf8', '#a78bfa', '#f0abfc']}
            fillOpacity={0}
          >
            <div className="about-main-card-inner">
              <h2 className="about-statement">
                <ScrambledText
                  as="span"
                  radius={120}
                  duration={1.0}
                  speed={0.4}
                  scrambleChars=".:-=+*"
                >
                  {profile.about.statement}
                </ScrambledText>
              </h2>

              <div className="about-body-columns">
                <div className="about-body-en">
                  <p>{profile.about.intro}</p>
                </div>
                <div className="about-body-cn">
                  <p>{profile.about.chinese}</p>
                </div>
              </div>

              <div className="about-meta-row">
                <div className="about-keywords">
                  {keywords.map((kw) => (
                    <span key={kw} className="about-keyword-chip">{kw}</span>
                  ))}
                </div>
                <div className="about-rhythm">
                  <span className="about-rhythm-label">Current rhythm</span>
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
              </div>
            </div>
          </BorderGlow>
        </ScrollReveal>
      </div>
    </section>
  )
}
