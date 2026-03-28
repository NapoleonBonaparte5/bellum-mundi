// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLES INDEX PAGE
// /es/batallas · /en/battles
// SSR — full list generated at build time for SEO
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { BattlesClient } from '@/components/battles/BattlesClient'

export const revalidate = 3600

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
    <div className="px-4 md:px-8 pt-8 pb-4 max-w-content mx-auto">
      {/* Page header */}
      <div className="index-header mb-6" style={{ width:'100%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="eyebrow mb-3 w-full text-center">
          {l === 'en' ? 'Military Encyclopedia' : 'Enciclopedia Militar'}
        </div>
        <h1 className="font-playfair font-bold text-cream mb-4 w-full text-center" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
          {l === 'en' ? '⚔ All Battles' : '⚔ Todas las Batallas'}
        </h1>
        <p className="font-crimson italic text-mist text-xl max-w-2xl mb-6 text-center mx-auto">
          {l === 'en'
            ? 'Complete index · Click any battle to view the full AI analysis · Enable comparison mode to compare two battles'
            : 'Índice completo · Haz clic en cualquier batalla para ver el análisis completo · Activa el modo comparación para comparar dos batallas'
          }
        </p>
        <div className="gold-divider mx-auto" />
      </div>

      {/* Gradient separator */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)', margin: '0 0 2rem' }} />

      {/* Interactive client component loads data directly */}
      <BattlesClient lang={l} />
    </div>
  )
}
