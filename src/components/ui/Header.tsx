import { Menu, X } from 'lucide-react'
import { useState } from 'react'

import { navigation } from '../../data/links'
import { profile } from '../../data/profile'

type HeaderProps = {
  activePage?: 'home' | 'lab'
}

export function Header({ activePage = 'home' }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
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
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={activePage === 'home' && item.href === '#home' ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#/motion-lab"
            className={activePage === 'lab' ? 'is-active' : ''}
            onClick={() => setOpen(false)}
          >
            Lab
          </a>
        </div>
      </nav>
    </header>
  )
}
