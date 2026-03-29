// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — HOME PAGE (/es · /en)
// SSR — rendered on server for SEO
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

import { HeroSection } from '@/components/home/HeroSection'
import { EraCategoryBar } from '@/components/home/EraCategoryBar'
import { LegendaryBattlesSection } from '@/components/home/LegendaryBattlesSection'
import { EditorialSection } from '@/components/home/EditorialSection'
import { TimelineSection } from '@/components/home/TimelineSection'
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

  const keywords = isEN
    ? ['military history', 'historical battles', 'military commanders', 'world wars strategy', 'ancient warfare', 'AI military analysis', 'battle encyclopedia']
    : ['historia militar', 'batallas históricas', 'comandantes militares', 'guerras mundiales', 'estrategia militar', 'análisis IA historia', 'enciclopedia batallas']

  return {
    title,
    description,
    keywords,
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

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bellum Mundi',
    url: 'https://bellummundi.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bellummundi.com/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Announcement bar */}
      <div
        className="bg-gradient-to-r from-blood to-crimson py-2.5 px-8 text-center font-cinzel text-[0.62rem] tracking-[0.2em] text-parchment relative"
        role="banner"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: l === 'en'
              ? '⚔ New: <span class="text-gold-light font-bold">890+ documented battles</span> · AI analysis across all eras · <span class="text-gold-light font-bold">3D View in development</span>'
              : '⚔ Nuevo: <span class="text-gold-light font-bold">890+ batallas documentadas</span> · Análisis con IA en todas las eras · <span class="text-gold-light font-bold">Vista 3D en desarrollo</span>',
          }}
        />
      </div>

      {/* Hero */}
      <HeroSection lang={l} />

      {/* Golden divider strip between Hero and Era bar */}
      <div aria-hidden="true" style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.08) 10%, rgba(201,168,76,0.5) 30%, #C9A84C 50%, rgba(201,168,76,0.5) 70%, rgba(201,168,76,0.08) 90%, transparent 100%)',
        boxShadow: '0 0 16px rgba(201,168,76,0.2)',
      }} />

      {/* Era category bar */}
      <EraCategoryBar lang={l} />

      {/* Legendary battles 3×2 grid (B5) */}
      <LegendaryBattlesSection lang={l} />

      {/* Editorial blocks */}
      <EditorialSection lang={l} />

      {/* Timeline + Era explorer */}
      <TimelineSection lang={l} />

      {/* Pricing */}
      <PricingSection lang={l} />

      {/* Newsletter */}
      <NewsletterSection lang={l} />
    </>
  )
}
