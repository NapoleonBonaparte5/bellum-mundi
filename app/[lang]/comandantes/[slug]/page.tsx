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

export async function generateMetadata({ params }: CommanderPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const result = getCommanderBySlug(slug)
  if (!result) return {}
  const { commander, era } = result
  return {
    title: commander.name,
    description: `${commander.role} · ${era.name} · ${lang === 'en' ? 'Military profile and AI analysis' : 'Perfil militar y análisis con IA'}`,
    openGraph: { title: `${commander.name} — Bellum Mundi` },
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
