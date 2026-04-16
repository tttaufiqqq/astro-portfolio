/**
 * Design tokens — dark navy + cyan portfolio palette.
 * Source: portfoliot/resources/js/lib/tokens.ts
 *
 * Usage: import { colors, spacing, recipes } from '@/lib/tokens'
 */

export const colors = {
  spaceСadet: {
    hex: '#0b132b',
    tw: { bg: 'bg-space-cadet', text: 'text-space-cadet', border: 'border-space-cadet' },
  },
  oxfordBlue: {
    hex: '#1c2541',
    tw: { bg: 'bg-oxford-blue', text: 'text-oxford-blue', border: 'border-oxford-blue' },
  },
  yinmnBlue: {
    hex: '#3a506b',
    tw: { bg: 'bg-yinmn-blue', text: 'text-yinmn-blue', border: 'border-yinmn-blue' },
  },
  cyanAccent: {
    hex: '#6fffe9',
    tw: { bg: 'bg-cyan-accent', text: 'text-cyan-accent', border: 'border-cyan-accent' },
  },
  text: {
    primary: 'text-white',
    body: 'text-slate-200',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    faint: 'text-slate-500',
    accent: 'text-cyan-accent',
    accentMuted: 'text-cyan-accent/80',
  },
  bg: {
    body: 'bg-space-cadet',
    card: 'bg-oxford-blue',
    input: 'bg-space-cadet',
    accentSubtle: 'bg-cyan-accent/5',
    navBar: 'bg-space-cadet/80',
  },
  border: {
    card: 'border-yinmn-blue/30',
    cardHover: 'border-cyan-accent/50',
    input: 'border-yinmn-blue/30',
    inputFocus: 'border-cyan-accent',
    badge: 'border-cyan-accent/30',
    tagChip: 'border-cyan-accent/20',
    skillBadge: 'border-yinmn-blue/20',
    skillBadgeHover: 'border-cyan-accent/30',
    nav: 'border-oxford-blue',
    sectionHeading: 'border-cyan-accent',
    timeline: 'border-yinmn-blue/30',
    secondaryButton: 'border-yinmn-blue',
    footer: 'border-yinmn-blue/20',
  },
} as const;

export const typography = {
  font: { sans: 'font-sans', mono: 'font-mono' },
  size: {
    xs: 'text-xs',
    sm: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '5xl': 'text-5xl',
    '7xl': 'text-7xl',
    tagChip: 'text-[10px]',
  },
  weight: { bold: 'font-bold', semibold: 'font-semibold', medium: 'font-medium' },
  tracking: { tight: 'tracking-tight', wider: 'tracking-wider', widest: 'tracking-widest' },
  leading: { tight: 'leading-tight', relaxed: 'leading-relaxed' },
} as const;

export const spacing = {
  container: 'max-w-7xl mx-auto px-6',
  containerNarrow: 'max-w-3xl',
  containerHero: 'max-w-2xl',
  section: 'py-24 px-6',
  heroTop: 'pt-32',
  heroBottom: 'pb-20',
  card: 'p-6',
  cardLarge: 'p-8',
  input: 'px-4 py-3',
  buttonLarge: 'px-8 py-3',
  buttonSmall: 'px-4 py-1.5',
  tagChip: 'px-2 py-1',
  gap: { sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' },
  stack: { xs: 'space-y-2', sm: 'space-y-4' },
  inline: { xs: 'space-x-3', sm: 'space-x-6', md: 'space-x-8' },
} as const;

export const radius = {
  tag: 'rounded',
  input: 'rounded-lg',
  card: 'rounded-xl',
  image: 'rounded-2xl',
  form: 'rounded-3xl',
  pill: 'rounded-full',
} as const;

export const shadows = {
  button: 'shadow-lg shadow-cyan-accent/10',
  timelineDot: 'shadow-[0_0_10px_rgba(111,255,233,0.5)]',
} as const;

export const transitions = {
  default: 'transition',
  colors: 'transition-colors',
  all: 'transition-all',
  fast: 'duration-200',
  slow: 'duration-1000',
} as const;

export const layout = {
  navbar: 'fixed top-0 w-full z-50 bg-space-cadet/80 backdrop-blur-md border-b border-oxford-blue h-16',
  grid: {
    twoCol: 'grid md:grid-cols-2',
    projects: 'grid md:grid-cols-2 lg:grid-cols-3',
    skills: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  navLinkUnderline: 'absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-accent transition-all group-hover:w-full',
} as const;

export const recipes = {
  buttonPrimary:
    'bg-cyan-accent text-space-cadet px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-lg shadow-cyan-accent/10',
  buttonSecondary:
    'border border-yinmn-blue px-8 py-3 rounded-lg font-bold hover:bg-oxford-blue transition-colors',
  badgePill:
    'inline-block px-4 py-1.5 rounded-full border border-cyan-accent/30 bg-cyan-accent/5 text-cyan-accent text-xs font-mono uppercase tracking-widest',
  tagChip:
    'text-[10px] font-mono uppercase tracking-wider bg-space-cadet px-2 py-1 rounded text-cyan-accent/80 border border-cyan-accent/20',
  sectionHeading:
    'text-3xl font-bold inline-block border-b-2 border-cyan-accent pb-2',
  formInput:
    'w-full bg-space-cadet border border-yinmn-blue/30 rounded-lg px-4 py-3 focus:border-cyan-accent outline-none transition-colors text-white',
  formLabel:
    'text-xs font-mono uppercase tracking-wider text-slate-400',
  projectCard:
    'bg-oxford-blue p-6 rounded-xl border border-yinmn-blue/30 hover:border-cyan-accent/50 transition-all group h-full flex flex-col',
  skillBadge:
    'flex items-center space-x-3 bg-oxford-blue px-4 py-3 rounded-lg border border-yinmn-blue/20 hover:border-cyan-accent/30 transition-colors',
} as const;
