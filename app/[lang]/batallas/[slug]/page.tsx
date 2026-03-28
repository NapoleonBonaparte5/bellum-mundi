// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLE DETAIL PAGE
// /es/batallas/[slug] · /en/batallas/[slug]
// Full SSG + rich metadata for SEO
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getBattleBySlug, getAllBattles } from '@/lib/data/helpers'
import { getBattleName, translateCombatants, getEraName, translateYear } from '@/lib/i18n'
import { BattleDetailClient } from '@/components/battles/BattleDetailClient'

const BASE = 'https://bellummundi.com'

interface BattlePageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const battles = getAllBattles()
  const langs: Lang[] = ['es', 'en']
  return langs.flatMap(lang =>
    battles.map(b => ({ lang, slug: b.slug }))
  )
}

export async function generateMetadata({ params }: BattlePageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const l = lang as Lang
  const isEN = l === 'en'
  const result = getBattleBySlug(slug)
  if (!result) return {}

  const { battle, era } = result
  const name = getBattleName(l, battle.name)
  const eraName = getEraName(l, era.id, era.name)
  const combatants = translateCombatants(l, battle.combatants)
  const year = translateYear(l, battle.year)

  const title = isEN
    ? `${name} (${year}) — Historical Analysis`
    : `${battle.name} (${year}) — Análisis Histórico`

  const rawDesc = `${eraName} · ${combatants}. ${battle.desc}`
  const description = rawDesc.length > 155 ? rawDesc.slice(0, 152) + '...' : rawDesc

  const pageUrl = `${BASE}/${l}/batallas/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        es: `${BASE}/es/batallas/${slug}`,
        en: `${BASE}/en/batallas/${slug}`,
        'x-default': `${BASE}/es/batallas/${slug}`,
      },
    },
    openGraph: {
      title: `${title} · Bellum Mundi`,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'Bellum Mundi',
      images: [{ url: `${BASE}/opengraph-image.png`, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · Bellum Mundi`,
      description,
      images: [`${BASE}/opengraph-image.png`],
    },
  }
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { lang, slug } = await params
  const l = lang as Lang

  const result = getBattleBySlug(slug)
  if (!result) notFound()

  const { battle, era } = result
  const name = getBattleName(l, battle.name)
  const combatants = translateCombatants(l, battle.combatants)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: name,
    description: battle.desc,
    datePublished: battle.year,
    inLanguage: l,
    url: `${BASE}/${l}/batallas/${slug}`,
    author: { '@type': 'Organization', name: 'Bellum Mundi', url: BASE },
    publisher: {
      '@type': 'Organization',
      name: 'Bellum Mundi',
      url: BASE,
      logo: { '@type': 'ImageObject', url: `${BASE}/opengraph-image.png` },
    },
    about: {
      '@type': 'Event',
      name,
      description: combatants,
      startDate: battle.year,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BattleDetailClient battle={battle} era={era} lang={l} />
    </>
  )
}
