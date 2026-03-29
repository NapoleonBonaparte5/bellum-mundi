// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LANGUAGE LAYOUT ([lang])
// Validates the lang param and provides it to all children
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/Toaster'
import { BackToTopButton } from '@/components/ui/BackToTopButton'
import { ReadingProgress } from '@/components/ui/ReadingProgress'
import { LangSync } from '@/components/ui/LangSync'

export const SUPPORTED_LANGS: Lang[] = ['es', 'en']

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'

  return {
    alternates: {
      languages: {
        'es': '/es',
        'en': '/en',
      },
    },
    description: isEN
      ? 'The most complete military history encyclopedia. 890+ battles, 500+ commanders, interactive maps and AI analysis.'
      : 'La enciclopedia más completa de historia militar. 890+ batallas, 500+ comandantes, mapas interactivos y análisis con IA.',
  }
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params

  // Validate language
  if (!SUPPORTED_LANGS.includes(lang as Lang)) {
    notFound()
  }

  const validLang = lang as Lang

  return (
    <>
      <LangSync lang={validLang} />
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-gold focus:text-ink focus:px-4 focus:py-2 focus:font-cinzel focus:text-xs focus:tracking-widest focus:uppercase"
      >
        {validLang === 'en' ? 'Skip to content' : 'Saltar al contenido'}
      </a>

      <NavBar lang={validLang} />

      <main id="main-content" className="page-enter">
        {children}
      </main>

      <Footer lang={validLang} />
      <Toaster />
      <BackToTopButton />
      <ReadingProgress />
    </>
  )
}
