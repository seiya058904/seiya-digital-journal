export type EffectStatus = 'core' | 'ready' | 'experimental' | 'heavy'
export type EffectType = 'text' | 'card' | 'cursor' | 'navigation' | '3d' | 'experimental'
export type EffectDeps = 'none' | 'motion' | 'gsap' | 'three' | 'three + postprocessing'
export type EffectIntegrationStatus = 'real-demo' | 'metadata-only' | 'planned'

export type EffectMeta = {
  id: string
  name: string
  type: EffectType
  deps: EffectDeps
  status: EffectStatus
  description: string
  where: string
  category: string
  sourceFile: string
  integrationStatus: EffectIntegrationStatus
  homepageUsage: boolean
}

type BaseEffectMeta = Omit<
  EffectMeta,
  'sourceFile' | 'integrationStatus' | 'homepageUsage'
>

const effectMetadata = [
  {
    id: 'gradient-text',
    name: 'GradientText',
    type: 'text',
    deps: 'motion',
    status: 'core',
    description: 'Animated gradient text with customizable colors and direction.',
    where: 'Hero heading, Motion Lab',
    category: 'Text',
  },
  {
    id: 'shiny-text',
    name: 'ShinyText',
    type: 'text',
    deps: 'motion',
    status: 'core',
    description: 'Subtle shine sweep across text. Single-accent, not rainbow.',
    where: 'Hero, Thoughts, Motion Lab',
    category: 'Text',
  },
  {
    id: 'rotating-text',
    name: 'RotatingText',
    type: 'text',
    deps: 'motion',
    status: 'core',
    description: 'Auto-rotating text with staggered character animation.',
    where: 'Hero secondary words, Motion Lab',
    category: 'Text',
  },
  {
    id: 'border-glow',
    name: 'BorderGlow',
    type: 'card',
    deps: 'none',
    status: 'ready',
    description: 'Edge-sensitive directional glow that follows the cursor.',
    where: 'Hero portrait, Gallery',
    category: 'Cards',
  },
  {
    id: 'glare-hover',
    name: 'GlareHover',
    type: 'card',
    deps: 'none',
    status: 'core',
    description: 'Light sweep effect on hover. Pure CSS.',
    where: 'Gallery cards',
    category: 'Cards',
  },
  {
    id: 'profile-card',
    name: 'ProfileCard',
    type: 'card',
    deps: 'none',
    status: 'ready',
    description: 'Holographic profile card with tilt, shine, and behind-glow.',
    where: 'Hero, Motion Lab',
    category: 'Cards',
  },
  {
    id: 'tilted-card',
    name: 'TiltedCard',
    type: 'card',
    deps: 'motion',
    status: 'core',
    description: 'Spring-physics tilt on hover with optional caption.',
    where: 'Motion Lab',
    category: 'Cards',
  },
  {
    id: 'stack',
    name: 'Stack',
    type: 'card',
    deps: 'motion',
    status: 'ready',
    description: 'Draggable stacked cards that cycle to the back.',
    where: 'Motion Lab',
    category: 'Cards',
  },
  {
    id: 'bounce-cards',
    name: 'BounceCards',
    type: 'card',
    deps: 'gsap',
    status: 'ready',
    description: 'Cards fan out with elastic bounce animation.',
    where: 'Motion Lab',
    category: 'Cards',
  },
  {
    id: 'image-trail',
    name: 'ImageTrail',
    type: 'cursor',
    deps: 'gsap',
    status: 'experimental',
    description: 'Images follow the cursor in a trailing sequence.',
    where: 'Motion Lab',
    category: 'Cursor',
  },
  {
    id: 'magic-bento',
    name: 'MagicBento',
    type: 'card',
    deps: 'gsap',
    status: 'experimental',
    description: 'Bento grid with spotlight, tilt, magnetism, and particle effects.',
    where: 'Interests, Motion Lab',
    category: 'Cards',
  },
  {
    id: 'pill-nav',
    name: 'PillNav',
    type: 'navigation',
    deps: 'gsap',
    status: 'ready',
    description: 'Pill-shaped navigation with smooth hover transitions.',
    where: 'Header, Motion Lab',
    category: 'Navigation',
  },
  {
    id: 'scrambled-text',
    name: 'ScrambledText',
    type: 'text',
    deps: 'gsap',
    status: 'experimental',
    description: 'Text scrambles and reveals on hover. Hacker aesthetic.',
    where: 'Chapter labels, Motion Lab',
    category: 'Text',
  },
  {
    id: 'split-text',
    name: 'SplitText',
    type: 'text',
    deps: 'gsap',
    status: 'experimental',
    description: 'Per-character/word/line scroll-triggered animation.',
    where: 'Thoughts quote, Motion Lab',
    category: 'Text',
  },
  {
    id: 'animated-content',
    name: 'AnimatedContent',
    type: 'experimental',
    deps: 'gsap',
    status: 'ready',
    description: 'Scroll-triggered content entrance with direction and easing.',
    where: 'About, Motion Lab',
    category: 'Experimental',
  },
  {
    id: 'card-nav',
    name: 'CardNav',
    type: 'navigation',
    deps: 'gsap',
    status: 'ready',
    description: 'Card-based navigation with expand/collapse. Intentionally skipped — not planned.',
    where: 'Not integrated',
    category: 'Navigation',
  },
  {
    id: 'count-up',
    name: 'CountUp',
    type: 'text',
    deps: 'motion',
    status: 'ready',
    description: 'Animated number counter with separator support.',
    where: 'Motion Lab',
    category: 'Text',
  },
  {
    id: 'lanyard',
    name: 'Lanyard',
    type: '3d',
    deps: 'three',
    status: 'heavy',
    description: '3D physics lanyard card with Three.js + Rapier. Intentionally skipped — not planned.',
    where: 'Not integrated',
    category: '3D',
  },
  {
    id: 'grid-scan',
    name: 'GridScan',
    type: '3d',
    deps: 'three + postprocessing',
    status: 'heavy',
    description: '3D grid with scan line and post-processing effects.',
    where: 'Homepage background, Motion Lab',
    category: '3D',
  },
] satisfies BaseEffectMeta[]

const sourceFileByName: Record<string, string> = {
  GradientText: 'React bits/1.txt',
  BorderGlow: 'React bits/2.txt',
  Lanyard: 'React bits/3.txt',
  BounceCards: 'React bits/4.txt',
  GlareHover: 'React bits/5.txt',
  GridScan: 'React bits/6.txt',
  ImageTrail: 'React bits/7.txt',
  MagicBento: 'React bits/8.txt',
  PillNav: 'React bits/9.txt',
  ProfileCard: 'React bits/10.txt',
  RotatingText: 'React bits/11.txt',
  ScrambledText: 'React bits/12.txt',
  ShinyText: 'React bits/13.txt',
  SplitText: 'React bits/14.txt',
  AnimatedContent: 'React bits/15.txt',
  Stack: 'React bits/16.txt',
  TiltedCard: 'React bits/17.txt',
  CountUp: 'React bits/18.txt',
  CardNav: 'React bits/19.txt',
}

const realDemoNames = new Set([
  'GradientText',
  'ShinyText',
  'RotatingText',
  'BorderGlow',
  'GlareHover',
  'ProfileCard',
  'TiltedCard',
  'Stack',
  'PillNav',
  'GridScan',
  'BounceCards',
  'ImageTrail',
  'MagicBento',
  'ScrambledText',
  'SplitText',
  'AnimatedContent',
  'CountUp',
])

const homepageNames = new Set([
  'GradientText',
  'BorderGlow',
  'GlareHover',
  'RotatingText',
  'ShinyText',
  'ProfileCard',
  'PillNav',
  'GridScan',
  'MagicBento',
  'ScrambledText',
  'SplitText',
  'AnimatedContent',
])

const plannedNames = new Set<string>()

export const effects: EffectMeta[] = effectMetadata.map((effect) => ({
  ...effect,
  sourceFile: sourceFileByName[effect.name],
  integrationStatus: realDemoNames.has(effect.name)
    ? 'real-demo'
    : plannedNames.has(effect.name)
      ? 'planned'
      : 'metadata-only',
  homepageUsage: homepageNames.has(effect.name),
}))

export const effectCategories = [
  'Text',
  'Cards',
  'Cursor',
  'Navigation',
  '3D',
  'Experimental',
] as const
