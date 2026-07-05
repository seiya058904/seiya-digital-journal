import { Menu, X } from 'lucide-react'
import { useState, type MouseEvent } from 'react'

import { useAuth } from '../../auth/AuthContext'
import profileLogo from '../../assets/brand-icon.webp'
import { profile } from '../../data/profile'
import { getProfileAvatar } from '../../data/profileAvatars'
import { clearAuthReturnTarget, getPreSignOutRoute, navigateToAuth } from '../../lib/authRoutes'
import { useProfile } from '../../profile/ProfileContext'
import { CardNav, type CardNavItem } from '../effects/react-bits/CardNav'
import { PillNav } from '../effects/react-bits/PillNav'
import { AccountMenu } from './AccountMenu'

type HeaderProps = {
  activePage?: 'home' | 'lab' | 'archive' | 'archive-images' | 'archive-notes' | 'archive-notes-category' | 'archive-note-detail' | 'archive-projects' | 'gallery' | 'auth' | 'profile'
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
  const { isAuthenticated, loading, signOut, user } = useAuth()
  const { profile: accountProfile, loading: profileLoading, error: profileError } = useProfile()

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
      case 'auth': return '#/auth'
      case 'profile': return '#/profile'
      case 'lab': return '#/motion-lab'
      case 'archive-images': return '#/archive/images'
      case 'archive-notes':
      case 'archive-notes-category': return '#/archive/notes'
      case 'archive-projects': return '#/archive/projects'
      default: return `#/${activePage}`
    }
  }

  const accountDisplayName = accountProfile?.displayName ?? 'Account'
  const accountEmail = accountProfile?.email ?? user?.email ?? ''
  const isProfileLoaded = !profileLoading && accountProfile !== null
  const accountAvatar = isProfileLoaded
    ? getProfileAvatar(accountProfile.avatarKey)
    : null
  const isProfileError = !profileLoading && profileError !== null

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  const handleExplicitSignOut = async () => {
    setOpen(false)
    const preSignOutRoute = getPreSignOutRoute(window.location.hash)
    if (preSignOutRoute) {
      clearAuthReturnTarget()
      window.location.hash = preSignOutRoute
    }

    await handleSignOut()
  }

  const handleSignIn = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setOpen(false)
    navigateToAuth()
  }

  const handleProfileNavigation = () => {
    setOpen(false)
    window.location.hash = '#/profile'
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
      <div className="header-auth header-auth--desktop">
        {isAuthenticated ? (
          <AccountMenu
            avatarSrc={accountAvatar?.src ?? ''}
            displayName={accountDisplayName}
            email={accountEmail}
            loading={!isProfileLoaded && !isProfileError}
            onProfile={handleProfileNavigation}
            onSignOut={() => {
              void handleExplicitSignOut()
            }}
          />
        ) : (
          <a className="header-auth__button" href="#/auth" aria-disabled={loading} onClick={handleSignIn}>
            Sign in
          </a>
        )}
      </div>
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
          {isAuthenticated ? (
            <div className="header-mobile-account">
              <div className="header-mobile-account__summary">
                {accountAvatar ? (
                  <img src={accountAvatar.src} alt="" className="header-mobile-account__avatar" />
                ) : (
                  <span className="header-mobile-account__avatar header-mobile-account__avatar--placeholder" aria-hidden="true" />
                )}
                <div>
                  <span className="header-auth__name header-auth__name--mobile">{accountDisplayName}</span>
                  <span className="header-mobile-account__email">{accountEmail}</span>
                </div>
              </div>
              <button type="button" className="header-auth__button header-auth__button--mobile" onClick={handleProfileNavigation}>
                Profile
              </button>
              <button type="button" className="header-auth__button header-auth__button--mobile" onClick={() => void handleExplicitSignOut()}>
                Sign out
              </button>
            </div>
          ) : (
            <a href="#/auth" onClick={handleSignIn}>Sign in</a>
          )}
          <a href="#/lab" onClick={() => setOpen(false)}>Motion Lab</a>
        </div>
      </nav>
    </header>
  )
}
