// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ROOT LAYOUT
// ═══════════════════════════════════════════════════════════

import type { Metadata, Viewport } from 'next'
import { Cinzel, Playfair_Display, Crimson_Pro, IM_Fell_English } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

// ── FONTS ──────────────────────────────────────────────────
// CSS variable names prefixed with --bm- to avoid collision with Tailwind v4 --font-* namespace
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--bm-cinzel',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--bm-playfair',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--bm-crimson',
  display: 'swap',
})

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--bm-fell',
  display: 'swap',
})

// ── VIEWPORT ───────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0806',
}

// ── DEFAULT METADATA ───────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://bellummundi.com'),
  title: {
    default: 'Bellum Mundi — Historia Militar Universal',
    template: '%s · Bellum Mundi',
  },
  description: 'La enciclopedia más completa de historia militar. 8.000+ batallas, 1.200+ comandantes, mapas interactivos y análisis con IA.',
  keywords: ['historia militar', 'batallas históricas', 'comandantes militares', 'guerras mundiales', 'estrategia militar'],
  authors: [{ name: 'Bellum Mundi' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Bellum Mundi',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${cinzel.variable} ${playfair.variable} ${crimsonPro.variable} ${imFell.variable}`}
      style={{ background: '#0A0806', color: '#F9F5ED' }}
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body className="bg-ink text-cream font-crimson text-lg leading-relaxed overflow-x-hidden">
        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[1] opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
