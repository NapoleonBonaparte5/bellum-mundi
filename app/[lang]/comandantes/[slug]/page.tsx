// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDER DETAIL PAGE
// /es/comandantes/[slug] · SSG for SEO
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getCommanderBySlug, getAllCommanders } from '@/lib/data/helpers'
import { CommanderDetailClient } from '@/components/commanders/CommanderDetailClient'

interface CommanderPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const commanders = getAllCommanders()
  const langs: Lang[] = ['es', 'en']
  return langs.flatMap(lang =>
    commanders.map(c => ({ lang, slug: c.slug }))
  )
}

const BASE = 'https://bellummundi.com'

export async function generateMetadata({ params }: CommanderPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const isEN = lang === 'en'
  const result = getCommanderBySlug(slug)
  if (!result) return {}
  const { commander, era } = result
  const description = `${commander.role} · ${era.name} · ${isEN ? 'Military profile and AI analysis' : 'Perfil militar y análisis con IA'}`
  const pageUrl = `${BASE}/${lang}/comandantes/${slug}`
  return {
    title: commander.name,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        es: `${BASE}/es/comandantes/${slug}`,
        en: `${BASE}/en/comandantes/${slug}`,
      },
    },
    openGraph: {
      title: `${commander.name} — Bellum Mundi`,
      description,
      url: pageUrl,
      images: [{ url: `${BASE}/opengraph-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: `${commander.name} — Bellum Mundi`, description },
  }
}

export default async function CommanderPage({ params }: CommanderPageProps) {
  const { lang, slug } = await params
  const l = lang as Lang

  const result = getCommanderBySlug(slug)
  if (!result) notFound()

  const { commander, era } = result

  return <CommanderDetailClient commander={commander} era={era} lang={l} />
}
