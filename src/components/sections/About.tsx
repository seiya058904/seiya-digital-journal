import { profile } from '../../data/profile'
import { AnimatedContent } from '../effects/react-bits/AnimatedContent'
import { Chapter } from '../ui/Chapter'

export function About() {
  return (
    <section id="about" className="section section--about">
      <Chapter number="02" title="About" />
      <div className="about-grid">
        <AnimatedContent className="about-grid__intro" distance={70}>
          <p>{profile.about.intro}</p>
          <span>{profile.about.chinese}</span>
        </AnimatedContent>
        <AnimatedContent
          className="about-grid__statement"
          direction="horizontal"
          reverse
          distance={80}
          delay={0.12}
        >
          <h2>{profile.about.statement}</h2>
        </AnimatedContent>
      </div>
    </section>
  )
}
