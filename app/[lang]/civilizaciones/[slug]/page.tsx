// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATION DETAIL PAGE
// /es/civilizaciones/[slug] · /en/civilizaciones/[slug]
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllCivs, getCivBySlug } from '@/lib/data/helpers'
import { CivDetailClient } from '@/components/civs/CivDetailClient'

interface CivPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const civs = getAllCivs()
  const langs: Lang[] = ['es', 'en']
  return langs.flatMap(lang =>
    civs.map(c => ({ lang, slug: c.slug }))
  )
}

const BASE = 'https://bellummundi.com'

export async function generateMetadata({ params }: CivPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const isEN = lang === 'en'
  const result = getCivBySlug(slug)
  if (!result) return {}
  const { civ, era } = result
  const description = `${era.name} · ${civ.period} — ${isEN ? 'Military power analysis' : 'Análisis de poder militar'}`
  const pageUrl = `${BASE}/${lang}/civilizaciones/${slug}`
  return {
    title: civ.name,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        es: `${BASE}/es/civilizaciones/${slug}`,
        en: `${BASE}/en/civilizaciones/${slug}`,
      },
    },
    openGraph: {
      title: `${civ.name} — Bellum Mundi`,
      description,
      url: pageUrl,
      images: [{ url: `${BASE}/opengraph-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: `${civ.name} — Bellum Mundi`, description },
  }
}

export default async function CivPage({ params }: CivPageProps) {
  const { lang, slug } = await params
  const l = lang as Lang

  const result = getCivBySlug(slug)
  if (!result) notFound()

  const { civ, era } = result
  return <CivDetailClient civ={civ} era={era} lang={l} />
}
