import { ArrowUp, BriefcaseBusiness, GitBranch, Mail } from 'lucide-react'

import { socialLinks } from '../../data/links'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const icons = {
  email: Mail,
  github: GitBranch,
  work: BriefcaseBusiness,
}

export function Contact() {
  return (
    <section id="contact" className="section section--contact">
      <Chapter number="07" title="Contact" />
      <div className="contact-grid">
        <ScrollReveal>
          <p className="contact-kicker">This site is still evolving.</p>
          <h2>Let’s connect.</h2>
        </ScrollReveal>
        <ScrollReveal className="contact-links" delay={0.12}>
          {socialLinks.map((link) => {
            const Icon = icons[link.kind]
            return (
              <a
                key={link.kind}
                href={link.href}
                aria-disabled={link.placeholder}
                title="Placeholder — update this address in src/data/links.ts"
                onClick={(event) => link.placeholder && event.preventDefault()}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.45} />
                <span>{link.label}</span>
                <small>add link</small>
              </a>
            )
          })}
          <a href="#home">
            <ArrowUp aria-hidden="true" size={20} strokeWidth={1.45} />
            <span>Back to top</span>
          </a>
        </ScrollReveal>
      </div>
      <footer>
        <p>Built with React, motion, and curiosity. / 用代码保存一点点热爱。</p>
        <span>© {new Date().getFullYear()} Sia</span>
      </footer>
    </section>
  )
}
