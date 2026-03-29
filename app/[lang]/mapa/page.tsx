// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP PAGE
// Interactive Leaflet map of all battles with coordinates
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllBattles } from '@/lib/data/helpers'
import { WorldMapWrapper } from '@/components/map/WorldMapWrapper'

export const revalidate = 3600

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
      <div className="px-4 md:px-8 max-w-content mx-auto">
        <div className="epic-header-wrap">
        <div className="index-header" style={{ width:'100%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div className="eyebrow mb-3 w-full text-center">
            {l === 'en' ? 'Historical Cartography' : 'Cartografía Histórica'}
          </div>
          <h1 className="font-playfair font-bold text-cream mb-4 w-full text-center" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
            🗺️ {l === 'en' ? 'World Battle Map' : 'Mapa Mundial de Batallas'}
          </h1>
          <p className="font-crimson italic text-mist text-xl max-w-2xl mb-4 text-center mx-auto">
            {l === 'en'
              ? `${battles.length} battles with geolocation · Click any marker to view details`
              : `${battles.length} batallas con geolocalización · Haz clic en cualquier marcador`
            }
          </p>
          <div className="gold-divider mx-auto" />
        </div>
        </div>
      </div>
      <WorldMapWrapper battles={battles} lang={l} />
    </div>
  )
}
