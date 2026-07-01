import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import profileLogo from '../../assets/profile-placeholder.svg'
import { profile } from '../../data/profile'
import { PillNav } from '../effects/react-bits/PillNav'

type HeaderProps = {
  activePage?: 'home' | 'lab'
}

const headerItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Thoughts', href: '#thoughts' },
  { label: 'Lab', href: '#/motion-lab' },
  { label: 'Contact', href: '#contact' },
]

export function Header({ activePage = 'home' }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const handleNavigation = (href: string) => {
    setOpen(false)
    if (activePage !== 'lab' || href === '#/motion-lab') return

    requestAnimationFrame(() => {
      document.getElementById(href.slice(1))?.scrollIntoView()
    })
  }

  return (
    <header className="site-header">
      <PillNav
        className="header-pill-nav"
        logo={profileLogo}
        logoAlt={`${profile.brand} home`}
        items={headerItems}
        activeHref={activePage === 'lab' ? '#/motion-lab' : '#home'}
        baseColor="rgba(5, 10, 24, 0.82)"
        pillColor="rgba(18, 29, 54, 0.72)"
        hoveredPillTextColor="#f3f6ff"
        pillTextColor="#9ca6bb"
        onItemClick={(item) => handleNavigation(item.href)}
      />
      <nav className="nav-shell header-mobile-nav" aria-label="Primary navigation">
        <a
          className="brand"
          href="#/"
          onClick={() => setOpen(false)}
        >
          {profile.brand}
        </a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <div id="site-menu" className={`nav-links ${open ? 'is-open' : ''}`}>
          {headerItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                (activePage === 'home' && item.href === '#home') ||
                (activePage === 'lab' && item.href === '#/motion-lab')
                  ? 'is-active'
                  : ''
              }
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
