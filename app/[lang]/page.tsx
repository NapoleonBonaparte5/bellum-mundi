// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — HOME PAGE (/es · /en)
// SSR — rendered on server for SEO
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

import { HeroSection } from '@/components/home/HeroSection'
import { StatsSection } from '@/components/home/StatsSection'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { TimelineSection } from '@/components/home/TimelineSection'
import { WarQuoteSection } from '@/components/home/WarQuoteSection'
import { PricingSection } from '@/components/home/PricingSection'
import { NewsletterSection } from '@/components/home/NewsletterSection'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  const BASE = 'https://bellummundi.com'
  const pageUrl = `${BASE}/${l}`
  const title = isEN ? 'Bellum Mundi — Universal Military History Encyclopedia' : 'Bellum Mundi — Historia Militar Universal'
  const description = isEN
    ? 'The most complete military history encyclopedia. 8,000+ battles, 1,200+ commanders, interactive maps and AI analysis. From Antiquity to the 21st Century.'
    : 'La enciclopedia más completa de historia militar en español. 8.000+ batallas, 1.200+ comandantes, mapas interactivos y análisis con IA.'
  const ogImage = `${BASE}/opengraph-image.png`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: { es: `${BASE}/es`, en: `${BASE}/en`, 'x-default': `${BASE}/es` },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'Bellum Mundi',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Bellum Mundi' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const l = lang as Lang

  return (
    <>
      {/* Announcement bar */}
      <div
        className="bg-gradient-to-r from-blood to-crimson py-2.5 px-8 text-center font-cinzel text-[0.62rem] tracking-[0.2em] text-parchment relative"
        role="banner"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: l === 'en'
              ? '⚔ New: <span class="text-gold-light font-bold">The Battle of Waterloo</span> — Full AI Analysis · Over <span class="text-gold-light font-bold">1,200</span> newsletter subscribers this week'
              : '⚔ Nuevo: <span class="text-gold-light font-bold">La Batalla de Waterloo</span> — Análisis completo con IA · Más de <span class="text-gold-light font-bold">1.200</span> suscriptores del newsletter esta semana',
          }}
        />
      </div>

      {/* Hero */}
      <HeroSection lang={l} />

      {/* Stats */}
      <StatsSection lang={l} />

      {/* Features */}
      <FeaturesSection lang={l} />

      {/* Timeline + Era explorer */}
      <TimelineSection lang={l} />

      {/* War Quote */}
      <WarQuoteSection lang={l} />

      {/* Pricing */}
      <PricingSection lang={l} />

      {/* Newsletter */}
      <NewsletterSection lang={l} />
    </>
  )
}
