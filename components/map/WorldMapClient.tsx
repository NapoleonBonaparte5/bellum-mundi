'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP CLIENT
// Leaflet map with all geolocated battles
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, ERA_COLORS } from '@/lib/data/helpers'

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => (
  <div className="w-full h-[600px] bg-slate flex items-center justify-center">
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

  // Get unique eras
  const eras = useMemo(() => {
    const seen = new Map<string, string>()
    battles.forEach(b => { if (!seen.has(b.eraId)) seen.set(b.eraId, b.eraName) })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [battles])

  const filtered = eraFilter === 'all' ? battles : battles.filter(b => b.eraId === eraFilter)

  return (
    <div>
      {/* Era filter */}
      <div className="px-8 py-4 flex flex-wrap gap-2 border-b border-gold/10">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas' : 'All'} ({battles.length})
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {era.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <LeafletMap battles={filtered} lang={lang} eraColors={ERA_COLORS} onSelect={setSelected} />

      {/* Selected battle panel */}
      {selected && (
        <div className="mx-8 my-4 bg-slate border border-gold/20 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mb-1">{selected.year}</div>
            <div className="font-playfair font-bold text-cream text-xl mb-1">{selected.name}</div>
            <div className="font-crimson text-smoke">{selected.combatants}</div>
            {selected.desc && <div className="font-crimson text-parchment-dark/70 text-sm mt-2">{selected.desc}</div>}
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href={`/${lang}/batallas/${selected.slug}`}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {isES ? 'Ver batalla →' : 'View battle →'}
            </Link>
            <button onClick={() => setSelected(null)} className="text-smoke hover:text-gold text-xl">×</button>
          </div>
        </div>
      )}

      <div className="px-8 py-2 font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">
        {filtered.length} {isES ? 'batallas en el mapa' : 'battles on the map'}
      </div>
    </div>
  )
}
