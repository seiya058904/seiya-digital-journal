import { ArrowUp, BriefcaseBusiness, Copy, GitBranch, Mail } from 'lucide-react'
import { useCallback, useState } from 'react'

import { socialLinks } from '../../data/links'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const icons = {
  email: Mail,
  github: GitBranch,
  work: BriefcaseBusiness,
}

const EMAIL_ADDRESS = 'sunmengsaiyi@gmail.com'

const externalKinds = new Set(['github', 'work'])

export function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <section id="contact" className="section section--contact">
      <Chapter number="07" title="Contact" />
      <div className="contact-grid">
        <ScrollReveal>
          <p className="contact-kicker">This journal is still growing.</p>
          <h2>Let&rsquo;s connect.</h2>
        </ScrollReveal>
        <ScrollReveal className="contact-links" delay={0.12}>
          {socialLinks.map((link) => {
            const Icon = icons[link.kind]
            const isExternal = externalKinds.has(link.kind)
            return (
              <a
                key={link.kind}
                href={link.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.45} />
                <span>{link.label}</span>
                {link.kind === 'email' ? (
                  <span className="contact-link-detail">
                    {EMAIL_ADDRESS}
                    <button
                      type="button"
                      className="contact-copy-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleCopyEmail()
                      }}
                      aria-label="Copy email address"
                      title="Copy email address"
                    >
                      <Copy size={13} strokeWidth={1.6} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </span>
                ) : null}
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
        <p>Crafted with motion, precision, and curiosity. / 用代码保存一点点热爱。</p>
        <span>&copy; {new Date().getFullYear()} Seiya</span>
      </footer>
    </section>
  )
}
