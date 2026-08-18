import { ArrowUp, BriefcaseBusiness, Copy, GitBranch, Mail } from 'lucide-react'
import { useCallback, useState } from 'react'

import { socialLinks } from '../../data/links'
import { MultiStepLoader } from '../effects/MultiStepLoader'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const icons = {
  email: Mail,
  github: GitBranch,
  work: BriefcaseBusiness,
}

const EMAIL_ADDRESS = 'sunmengsaiyi@gmail.com'

const externalKinds = new Set(['github', 'work'])

const supportLoadingStates = [
  { text: 'Detecting suspiciously generous clicks...' },
  { text: 'Stealing one imaginary click-coin...' },
  { text: 'Converting it into author motivation...' },
  { text: 'Depositing dopamine into Seiya\'s brain...' },
  { text: 'Author happiness increased by 1%.' },
  { text: 'Done. No real money was harmed.' },
]

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [supporting, setSupporting] = useState(false)

  const handleCopyEmail = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) return
      await navigator.clipboard.writeText(EMAIL_ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable or permission denied — fail silently
    }
  }, [])

  const handleSupportClose = useCallback(() => setSupporting(false), [])

  return (
    <section id="contact" className="section section--contact">
      <Chapter number="07" title="Contact" />
      <div className="contact-grid">
        <ScrollReveal>
          <p className="contact-kicker">This journal is still growing.</p>
          <h2>Let&rsquo;s connect.</h2>
          <button
            type="button"
            className="contact-support-btn"
            onClick={() => setSupporting(true)}
            aria-haspopup="dialog"
            aria-expanded={supporting}
          >
            <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
            <span className="text">Support me</span>
            <span className="circle" aria-hidden="true" />
            <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
            </svg>
          </button>
          <MultiStepLoader
            loadingStates={supportLoadingStates}
            loading={supporting}
            duration={1200}
            loop={false}
            onClose={handleSupportClose}
          />
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
