// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — DESIGN SYSTEM TOKENS
// Single source of truth for all design constants
// ═══════════════════════════════════════════════════════════

export const DESIGN = {
  fonts: {
    display: 'var(--font-cinzel)',
    serif: 'var(--font-playfair)',
    body: 'var(--font-crimson)',
    accent: 'var(--font-fell)',
  },
  colors: {
    gold: '#C9A84C',
    goldLight: '#E8C97A',
    goldDark: '#8B6914',
    ink: '#0A0806',
    slate: '#1A1814',
    steel: '#2A2822',
    cream: '#F9F5ED',
    smoke: '#6B6560',
    mist: '#9B9590',
    crimsonRed: '#8B1A1A',
    parchment: '#E8DFC8',
    ash: '#3A3830',
  },
  spacing: {
    section: '6rem',
    card: '1.5rem',
    page: '2rem',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  radius: {
    none: '0',
    sm: '2px',
    base: '4px',
    lg: '8px',
  },
  shadows: {
    card: '0 4px 20px rgba(0,0,0,0.4)',
    cardHover: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.2)',
    glow: '0 0 30px rgba(201,168,76,0.15)',
    goldGlow: '0 0 20px rgba(201,168,76,0.3)',
  },
} as const
