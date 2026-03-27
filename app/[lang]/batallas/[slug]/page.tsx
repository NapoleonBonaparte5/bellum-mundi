// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLE DETAIL PAGE
// /es/batallas/[slug] · /en/batallas/[slug]
// Full SSR + static generation for SEO
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getBattleBySlug, getAllBattles, ERA_EMOJIS } from '@/lib/data/helpers'
import { getBattleName, translateCombatants, getEraName, translateYear } from '@/lib/i18n/translations'
import { BattleDetailClient } from '@/components/battles/BattleDetailClient'

interface BattlePageProps {
  params: Promise<{ lang: string; slug: string }>
}

// Pre-generate all battle URLs at build time → instant + SEO
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
  const result = getBattleBySlug(slug)
  if (!result) return {}

  const { battle, era } = result
  const name = getBattleName(l, battle.name)
  const eraName = getEraName(l, era.id, era.name)

  return {
    title: name,
    description: `${eraName} · ${translateCombatants(l, battle.combatants)} · ${battle.desc}`,
    openGraph: {
      title: `${name} — Bellum Mundi`,
      description: `${eraName} · ${translateCombatants(l, battle.combatants)}`,
    },
  }
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { lang, slug } = await params
  const l = lang as Lang

  const result = getBattleBySlug(slug)
  if (!result) notFound()

  const { battle, era } = result

  return (
    <BattleDetailClient battle={battle} era={era} lang={l} />
  )
}
