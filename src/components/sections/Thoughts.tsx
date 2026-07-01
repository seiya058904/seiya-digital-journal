import { ArrowUpRight } from 'lucide-react'

import { thoughts } from '../../data/thoughts'
import { SplitText } from '../effects/react-bits/SplitText'
import { ShinyText } from '../effects/text/ShinyText'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

export function Thoughts() {
  return (
    <section id="thoughts" className="section section--thoughts">
      <Chapter number="05" title="Thoughts" />
      <div className="thoughts-grid">
        <ScrollReveal className="featured-thought">
          <span className="featured-thought__mark" aria-hidden="true">
            <ShinyText
              text={'"'}
              color="var(--color-gold)"
              shineColor="var(--color-text)"
              speed={0.4}
              spread={80}
              delay={3}
            />
          </span>
          <SplitText
            tag="h2"
            text={thoughts.featured.quote}
            splitType="words"
            delay={85}
            duration={1}
            threshold={0.15}
          />
          <p>{thoughts.featured.body}</p>
          <span>{thoughts.featured.chinese}</span>
        </ScrollReveal>
        <div className="thought-list" aria-label="Short thoughts">
          {thoughts.entries.map((thought, index) => (
            <ScrollReveal key={thought.title} delay={index * 0.08}>
              <a className="thought-row" href={thought.href} aria-label={thought.ariaLabel}>
                <span>0{index + 1}</span>
                <div>
                  <p>{thought.date}</p>
                  <h3>{thought.title}</h3>
                  <span>{thought.excerpt}</span>
                </div>
                <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.4} />
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
