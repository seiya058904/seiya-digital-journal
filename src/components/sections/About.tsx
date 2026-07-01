import { profile } from '../../data/profile'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

export function About() {
  return (
    <section id="about" className="section section--about">
      <Chapter number="02" title="About" />
      <div className="about-grid">
        <ScrollReveal className="about-grid__intro">
          <p>{profile.about.intro}</p>
          <span>{profile.about.chinese}</span>
        </ScrollReveal>
        <ScrollReveal className="about-grid__statement" delay={0.12}>
          <h2>{profile.about.statement}</h2>
        </ScrollReveal>
      </div>
    </section>
  )
}
