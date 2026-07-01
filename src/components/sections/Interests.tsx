import { profile } from '../../data/profile'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

export function Interests() {
  return (
    <section id="interests" className="section section--interests">
      <Chapter number="03" title="Interests" />
      <ScrollReveal className="section-intro">
        <p>Four signals I keep returning to.</p>
        <h2>Curiosity has more than one orbit.</h2>
      </ScrollReveal>
      <div className="interest-orbits">
        {profile.interests.map((interest, index) => (
          <ScrollReveal
            key={interest.title}
            className={`interest-orbit interest-orbit--${interest.accent}`}
            delay={index * 0.08}
          >
            <div className="interest-orbit__visual" aria-hidden="true">
              <i />
              <span />
            </div>
            <p className="interest-orbit__index">0{index + 1}</p>
            <h3>{interest.title}</h3>
            <p>{interest.description}</p>
            <span className="interest-orbit__cn">{interest.chinese}</span>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
