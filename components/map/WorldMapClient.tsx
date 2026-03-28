'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP CLIENT
// Leaflet map with all geolocated battles + era legend
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, ERA_COLORS } from '@/lib/data/helpers'
import { getEraName } from '@/lib/i18n'
import { ChipScroller } from '@/components/ui/ChipScroller'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => (
  <div className="w-full h-[60vh] md:h-[600px] bg-slate flex items-center justify-center">
    <div className="loading-dots"><span /><span /><span /></div>
  </div>
) })

interface WorldMapClientProps {
  battles: FlatBattle[]
  lang: Lang
}

export function WorldMapClient({ battles, lang }: WorldMapClientProps) {
  const isES = lang === 'es'
  const [eraFilter, setEraFilter] = useState('all')
  const [selected, setSelected] = useState<FlatBattle | null>(null)
  const [legendOpen, setLegendOpen] = useState(true)

  const eras = useMemo(() => {
    const seen = new Map<string, string>()
    battles.forEach(b => { if (!seen.has(b.eraId)) seen.set(b.eraId, b.eraName) })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [battles])

  const filtered = eraFilter === 'all' ? battles : battles.filter(b => b.eraId === eraFilter)

  return (
    <div>
      {/* Era filter — horizontal scroll with arrows */}
      <div className="px-8 py-4 border-b border-gold/10">
        <ChipScroller>
          <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
            {isES ? 'Todas' : 'All'} ({battles.length})
          </button>
          {eras.map(era => (
            <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
              {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
            </button>
          ))}
        </ChipScroller>
      </div>

      {/* Map container with legend overlay */}
      <div className="relative">
        <LeafletMap battles={filtered} lang={lang} eraColors={ERA_COLORS} onSelect={setSelected} />

        {/* Era color legend — bottom-left overlay */}
        <div className="map-era-legend">
          <button
            className="map-era-legend-title flex items-center gap-2 cursor-pointer pointer-events-auto w-full text-left"
            onClick={() => setLegendOpen(o => !o)}
            style={{ pointerEvents: 'auto' }}
          >
            <span>{isES ? 'Leyenda' : 'Legend'}</span>
            <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{legendOpen ? '▲' : '▼'}</span>
          </button>
          {legendOpen && eras.map(era => (
            <div key={era.id} className="map-era-legend-item">
              <div
                className="map-era-legend-dot"
                style={{ backgroundColor: ERA_COLORS[era.id as EraId] ?? '#C9A84C' }}
              />
              <span className="map-era-legend-name">{getEraName(lang, era.id as EraId, era.name)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected battle panel */}
      {selected && (
        <div className="mx-8 my-4 bg-slate border border-gold/20 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-gold uppercase mb-1">{selected.year}</div>
            <div className="font-playfair font-bold text-cream text-xl mb-1">{selected.name}</div>
            <div className="font-crimson text-smoke">{selected.combatants}</div>
            {selected.desc && <div className="font-crimson text-mist/80 italic text-sm mt-2">{selected.desc}</div>}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href={`/${lang}/batallas/${selected.slug}`}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {isES ? 'Ver batalla →' : 'View battle →'}
            </Link>
            <button onClick={() => setSelected(null)} className="text-smoke hover:text-gold text-xl transition-colors">×</button>
          </div>
        </div>
      )}

      <div className="px-8 py-2 font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">
        <span className="text-gold font-bold mr-1">{filtered.length}</span>
        {isES ? 'batallas en el mapa' : 'battles on the map'}
      </div>
    </div>
  )
}
