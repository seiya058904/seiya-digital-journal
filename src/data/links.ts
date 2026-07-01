export type NavigationItem = {
  label: string
  href: string
}

export type SocialLink = NavigationItem & {
  placeholder: boolean
  kind: 'email' | 'github' | 'work'
}

export const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Interests', href: '#interests' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Thoughts', href: '#thoughts' },
  { label: 'Journey', href: '#journey' },
  { label: 'Contact', href: '#contact' },
] satisfies NavigationItem[]

export const socialLinks = [
  { label: 'Email me', href: 'mailto:sunmengsaiyi@gmail.com', placeholder: false, kind: 'email' },
  { label: 'GitHub', href: 'https://github.com/seiya058904/', placeholder: false, kind: 'github' },
  { label: 'Visit my work', href: 'https://seiya058904.github.io/', placeholder: false, kind: 'work' },
] satisfies SocialLink[]
