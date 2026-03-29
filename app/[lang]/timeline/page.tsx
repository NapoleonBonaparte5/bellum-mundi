// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — GLOBAL TIMELINE PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllBattles } from '@/lib/data/helpers'
import { GlobalTimelineWrapper } from '@/components/timeline/GlobalTimelineWrapper'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en'
      ? 'Global Military Timeline — Bellum Mundi'
      : 'Línea del Tiempo Global — Bellum Mundi',
    description: lang === 'en'
      ? 'Explore 2,000+ battles across 50,000 years of military history. Zoom, pan and filter by era.'
      : 'Explora 2.000+ batallas a lo largo de 50.000 años de historia militar. Zoom, desplazamiento y filtro por era.',
  }
}

export default async function TimelinePage({ params }: PageProps) {
  const { lang } = await params
  const battles = getAllBattles()
  return <GlobalTimelineWrapper lang={lang} battles={battles} />
}
