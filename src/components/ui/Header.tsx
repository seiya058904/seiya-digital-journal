import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import profileLogo from '../../assets/brand-icon.webp'
import { profile } from '../../data/profile'
import { CardNav, type CardNavItem } from '../effects/react-bits/CardNav'
import { PillNav } from '../effects/react-bits/PillNav'

type HeaderProps = {
  activePage?: 'home' | 'lab' | 'archive' | 'archive-images' | 'archive-notes' | 'archive-notes-category' | 'archive-projects' | 'gallery'
}

const headerItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Thoughts', href: '#thoughts' },
  { label: 'Contact', href: '#contact' },
  { label: 'Archive', href: '#/archive' },
]

const exploreItems: CardNavItem[] = [
  {
    label: 'Start',
    bgColor: '#1B1722',
    textColor: '#fff',
    links: [
      { label: 'Home', href: '#home', ariaLabel: 'Back to top' },
      { label: 'Digital Journal', href: '#about', ariaLabel: 'About section' },
      { label: 'Contact', href: '#contact', ariaLabel: 'Contact section' },
    ],
  },
  {
    label: 'Explore',
    bgColor: '#16213B',
    textColor: '#fff',
    links: [
      { label: 'Visual Archive', href: '#gallery', ariaLabel: 'Visual Archive section' },
      { label: 'Thoughts', href: '#thoughts', ariaLabel: 'Journal thoughts' },
      { label: 'Motion Lab', href: '#/lab', ariaLabel: 'Motion Lab experiments' },
    ],
  },
  {
    label: 'Archive',
    bgColor: '#1A1B2E',
    textColor: '#fff',
    links: [
      { label: 'Image Vault', href: '#/archive/images', ariaLabel: 'Image Vault' },
      { label: 'Notes Vault', href: '#/archive/notes', ariaLabel: 'Notes Vault' },
      { label: 'Project Vault', href: '#/archive/projects', ariaLabel: 'Project Vault' },
    ],
  },
]

export function Header({ activePage = 'home' }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const isHashPage = activePage !== 'home'

  const handleNavigation = (href: string) => {
    setOpen(false)
    if (href.startsWith('#/')) return

    if (isHashPage) {
      window.location.hash = '#/'
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
        }, 60)
      })
      return
    }

    requestAnimationFrame(() => {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const getActiveHref = () => {
    if (!isHashPage) return '#home'
    switch (activePage) {
      case 'lab': return '#/motion-lab'
      case 'archive-images': return '#/archive/images'
      case 'archive-notes':
      case 'archive-notes-category': return '#/archive/notes'
      case 'archive-projects': return '#/archive/projects'
      default: return `#/${activePage}`
    }
  }

  return (
    <header className="site-header">
      <PillNav
        className="header-pill-nav"
        logo={profileLogo}
        logoAlt={`${profile.brand} home`}
        items={headerItems}
        activeHref={getActiveHref()}
        baseColor="rgba(18, 12, 35, 0.45)"
        pillColor="rgba(40, 28, 70, 0.55)"
        hoveredPillTextColor="#f3f6ff"
        pillTextColor="#d0d8e8"
        onItemClick={(item) => handleNavigation(item.href)}
      />
      <CardNav
        className="header-card-nav"
        items={exploreItems}
        baseColor="rgba(5, 10, 24, 0.25)"
        menuColor="#9ca6bb"
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
                (activePage === 'home' && item.href === '#home') ? 'is-active' : ''
              }
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </a>
          ))}
          <a href="#/lab" onClick={() => setOpen(false)}>Motion Lab</a>
        </div>
      </nav>
    </header>
  )
}
