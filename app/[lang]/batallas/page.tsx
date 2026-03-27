// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLES INDEX PAGE
// /es/batallas · /en/battles
// SSR — full list generated at build time for SEO
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { BattlesClient } from '@/components/battles/BattlesClient'

interface BattlesPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: BattlesPageProps): Promise<Metadata> {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  return {
    title: isEN ? 'All Battles' : 'Todas las Batallas',
    description: isEN
      ? '429 historical battles from all eras and civilizations. Filter by era, search by name, compare battles with AI.'
      : '429 batallas históricas de todas las eras y civilizaciones. Filtra por era, busca por nombre, compara batallas con IA.',
  }
}

export default async function BattlesPage({ params }: BattlesPageProps) {
  const { lang } = await params
  const l = lang as Lang

  return (
    <div className="px-4 md:px-8 py-8 max-w-content mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="eyebrow mb-2">
          {l === 'en' ? 'Military Encyclopedia' : 'Enciclopedia Militar'}
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-cream mb-3">
          {l === 'en' ? '⚔ All Battles' : '⚔ Todas las Batallas'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg">
          {l === 'en'
            ? 'Complete index · Click any battle to view the full AI analysis · Enable comparison mode to compare two battles'
            : 'Índice completo · Haz clic en cualquier batalla para ver el análisis completo · Activa el modo comparación para comparar dos batallas'
          }
        </p>
      </div>

      {/* Interactive client component loads data directly */}
      <BattlesClient lang={l} />
    </div>
  )
}
