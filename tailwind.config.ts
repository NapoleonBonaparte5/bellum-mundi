import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── BELLUM MUNDI COLOR SYSTEM ──────────────────────────
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#8B6914',
        },
        crimson: {
          DEFAULT: '#8B1A1A',
          light: '#C0392B',
        },
        blood: '#6B0F0F',
        ink: '#0A0806',
        parchment: {
          DEFAULT: '#F4ECD8',
          dark: '#D4C4A0',
        },
        slate: '#1A1814',
        steel: '#2A2822',
        ash: '#3D3A34',
        smoke: '#6B6560',
        mist: '#9B9590',
        cream: '#F9F5ED',
        emerald: {
          DEFAULT: '#1a6b3a',
          light: '#27ae60',
        },
      },

      // ── TYPOGRAPHY ─────────────────────────────────────────
      fontFamily: {
        cinzel: ['var(--bm-cinzel)', 'serif'],
        playfair: ['var(--bm-playfair)', 'serif'],
        crimson: ['var(--bm-crimson)', 'Georgia', 'serif'],
        fell: ['var(--bm-fell)', 'serif'],
      },

      // ── SPACING & SIZING ───────────────────────────────────
      maxWidth: {
        content: '1400px',
      },

      // ── ANIMATIONS ─────────────────────────────────────────
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'scale(0.9) translateY(20px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        dot: {
          '0%, 80%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
        scrollPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scaleY(1)' },
          '50%': { opacity: '1', transform: 'scaleY(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 1s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'modal-in': 'modalIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'dot': 'dot 1.2s ease-in-out infinite',
        'scroll-pulse': 'scrollPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },

      // ── BACKGROUND PATTERNS ────────────────────────────────
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gold-gradient': 'linear-gradient(135deg, #8B6914, #C9A84C)',
        'crimson-gradient': 'linear-gradient(160deg, rgba(139,26,26,0.35) 0%, rgba(10,8,6,0.98) 55%)',
      },

      // ── SHADOWS ────────────────────────────────────────────
      boxShadow: {
        'gold': '0 0 80px rgba(201,168,76,0.3), 0 4px 40px rgba(0,0,0,0.8)',
        'gold-sm': '0 0 14px rgba(201,168,76,0.45)',
        'modal': '0 20px 60px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [typography],
}

export default config
