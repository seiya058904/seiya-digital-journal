import { Orbit, Sparkles, Telescope } from 'lucide-react'

import { profile } from '../../data/profile'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const icons = [Orbit, Sparkles, Telescope]

export function Journey() {
  return (
    <section id="journey" className="section section--journey">
      <Chapter number="06" title="Journey" />
      <ScrollReveal className="journey-heading">
        <p>No finished story. Just a direction.</p>
        <h2>Becoming, one chapter at a time.</h2>
      </ScrollReveal>
      <div className="journey-line">
        {profile.journey.map((milestone, index) => {
          const Icon = icons[index]
          return (
            <ScrollReveal key={milestone.stage} className="journey-step" delay={index * 0.12}>
              <div className="journey-step__icon">
                <Icon aria-hidden="true" size={25} strokeWidth={1.35} />
              </div>
              <span>{milestone.stage}</span>
              <h3>{milestone.title}</h3>
              <p>{milestone.description}</p>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
