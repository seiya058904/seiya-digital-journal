import { profile } from '../../data/profile'
import { MagicBento } from '../effects/react-bits/MagicBento'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const interestItems = profile.interests.map((interest) => ({
  title: interest.title,
  description: interest.description,
  label: interest.chinese,
}))

export function Interests() {
  return (
    <section id="interests" className="section section--interests">
      <Chapter number="03" title="Interests" />
      <ScrollReveal className="section-intro">
        <p>Four signals I keep returning to.</p>
        <h2>Curiosity has more than one orbit.</h2>
      </ScrollReveal>
      <MagicBento
        className="interests-bento"
        items={interestItems}
        glowColor="86, 228, 255"
        spotlightRadius={320}
      />
    </section>
  )
}
