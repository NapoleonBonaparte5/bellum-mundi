// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP PAGE
// Interactive Leaflet map of all battles with coordinates
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllBattles } from '@/lib/data/helpers'
import { WorldMapClient } from '@/components/map/WorldMapClient'

interface MapPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'World Battle Map' : 'Mapa Mundial de Batallas',
    description: isEN
      ? 'Interactive world map with all historical battles. Filter by era, click any marker for details.'
      : 'Mapa mundial interactivo con todas las batallas históricas. Filtra por era, haz clic en cualquier marcador.',
  }
}

export default async function MapPage({ params }: MapPageProps) {
  const { lang } = await params
  const l = lang as Lang

  // Only battles with coordinates
  const battles = getAllBattles().filter(b => b.lat !== undefined && b.lng !== undefined)

  return (
    <div>
      <div className="px-8 py-8 max-w-content mx-auto">
        <div className="eyebrow mb-2">
          {l === 'en' ? 'Military Encyclopedia' : 'Enciclopedia Militar'}
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-cream mb-3">
          🗺️ {l === 'en' ? 'World Battle Map' : 'Mapa Mundial de Batallas'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg">
          {l === 'en'
            ? `${battles.length} battles with geolocation · Click any marker to view details`
            : `${battles.length} batallas con geolocalización · Haz clic en cualquier marcador`
          }
        </p>
      </div>
      <WorldMapClient battles={battles} lang={l} />
    </div>
  )
}
