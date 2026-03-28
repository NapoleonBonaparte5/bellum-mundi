'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP CLIENT (6A + 6B + 6D)
// Leaflet map + manual clustering + timeline slider
// + enriched popups + mobile bottom sheet
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, ERA_COLORS, parseYear } from '@/lib/data/helpers'
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

// ── Manual clustering (6A) ────────────────────────────────
interface ClusterPoint extends FlatBattle {
  isCluster: boolean
  count: number
  clusterBattles?: FlatBattle[]
}

function clusterBattles(battles: FlatBattle[], zoom: number): ClusterPoint[] {
  if (zoom >= 4) return battles.map(b => ({ ...b, isCluster: false, count: 1 }))
  const cellSize = zoom < 2 ? 30 : 15
  const cells = new Map<string, FlatBattle[]>()
  battles.forEach(b => {
    if (b.lat === undefined || b.lng === undefined) return
    const key = `${Math.floor(b.lat / cellSize)},${Math.floor(b.lng / cellSize)}`
    cells.set(key, [...(cells.get(key) ?? []), b])
  })
  return Array.from(cells.values()).map(group => ({
    ...group[0],
    isCluster: group.length > 1,
    count: group.length,
    clusterBattles: group,
  }))
}

export function WorldMapClient({ battles, lang }: WorldMapClientProps) {
  const isES = lang === 'es'
  const [eraFilter, setEraFilter] = useState('all')
  const [selected, setSelected] = useState<FlatBattle | null>(null)
  const [legendOpen, setLegendOpen] = useState(true)
  const [mapZoom, setMapZoom] = useState(2)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Timeline slider (6B) — -5000 to 2024
  const [sliderYear, setSliderYear] = useState(2024)

  const eras = useMemo(() => {
    const seen = new Map<string, string>()
    battles.forEach(b => { if (!seen.has(b.eraId)) seen.set(b.eraId, b.eraName) })
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [battles])

  // Filter by era + timeline slider
  const filtered = useMemo(() => {
    let res = eraFilter === 'all' ? battles : battles.filter(b => b.eraId === eraFilter)
    // Apply timeline year filter
    if (sliderYear < 2024) {
      res = res.filter(b => parseYear(b.year) <= sliderYear)
    }
    return res
  }, [battles, eraFilter, sliderYear])

  const clustered = useMemo(() => clusterBattles(filtered, mapZoom), [filtered, mapZoom])

  const sliderLabel = sliderYear < 0
    ? `${Math.abs(sliderYear)} ${isES ? 'a.C.' : 'BC'}`
    : `${sliderYear} ${isES ? 'd.C.' : 'AD'}`

  return (
    <div>
      {/* Era filter — horizontal scroll with arrows */}
      <div className="px-4 md:px-8 py-4 border-b border-gold/10">
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
        <LeafletMap
          battles={filtered}
          lang={lang}
          eraColors={ERA_COLORS}
          onSelect={setSelected}
          onZoomChange={setMapZoom}
        />

        {/* Era color legend — bottom-left overlay (hidden on mobile, moved to bottom sheet) */}
        <div className="map-era-legend hidden md:block">
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

      {/* Timeline slider (6B) */}
      <div className="px-4 md:px-8 py-4 border-t border-gold/10 bg-slate/30">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke uppercase flex-shrink-0">
            {isES ? 'Hasta el año:' : 'Up to year:'}
          </span>
          <input
            type="range"
            min={-5000}
            max={2024}
            step={10}
            value={sliderYear}
            onChange={e => setSliderYear(Number(e.target.value))}
            className="flex-1 min-w-[200px]"
            style={{ accentColor: 'var(--gold)' }}
            aria-label={isES ? 'Filtrar por año' : 'Filter by year'}
          />
          <span className="font-cinzel text-gold font-bold text-sm flex-shrink-0 w-24 text-right">
            {sliderLabel}
          </span>
          {sliderYear < 2024 && (
            <button
              onClick={() => setSliderYear(2024)}
              className="font-cinzel text-[0.5rem] tracking-wider text-smoke hover:text-gold uppercase transition-colors flex-shrink-0"
            >
              {isES ? '✕ Resetear' : '✕ Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Selected battle panel */}
      {selected && (
        <div className="mx-4 md:mx-8 my-4 bg-slate border border-gold/20 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-gold uppercase mb-1">{selected.year}</div>
            <div className="font-playfair font-bold text-cream text-xl mb-1">{selected.name}</div>
            <div className="font-crimson text-smoke">{selected.combatants}</div>
            {selected.desc && <div className="font-crimson text-mist/80 italic text-sm mt-2">{selected.desc.slice(0, 120)}…</div>}
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

      <div className="px-4 md:px-8 py-2 font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">
        <span className="text-gold font-bold mr-1">{filtered.length}</span>
        {isES ? 'batallas en el mapa' : 'battles on the map'}
        {sliderYear < 2024 && (
          <span className="ml-2 text-smoke/50">
            ({isES ? `hasta ${sliderLabel}` : `up to ${sliderLabel}`})
          </span>
        )}
      </div>

      {/* ── Mobile bottom sheet — filters + legend (6D) ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[700]"
        style={{
          transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 48px))',
          transition: 'transform 0.3s ease',
          background: 'var(--slate)',
          borderTop: '1px solid rgba(201,168,76,0.2)',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Handle */}
        <button
          onClick={() => setSheetOpen(o => !o)}
          className="w-full flex flex-col items-center py-3 gap-1.5"
          aria-label={sheetOpen ? (isES ? 'Cerrar filtros' : 'Close filters') : (isES ? 'Abrir filtros' : 'Open filters')}
        >
          <div style={{ width: '32px', height: '4px', background: 'rgba(201,168,76,0.3)', borderRadius: '2px' }} />
          <span className="font-cinzel text-[0.45rem] tracking-[0.2em] text-smoke/60 uppercase">
            {sheetOpen ? (isES ? '▼ Cerrar' : '▼ Close') : (isES ? '▲ Filtros y Leyenda' : '▲ Filters & Legend')}
          </span>
        </button>

        {/* Sheet content */}
        <div className="px-4 pb-6 space-y-4 max-h-72 overflow-y-auto">
          <div>
            <p className="font-cinzel text-[0.5rem] tracking-[0.2em] text-gold/60 uppercase mb-2">
              {isES ? 'Filtrar por Era' : 'Filter by Era'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setEraFilter('all')} className={`chip text-[0.5rem] py-0.5 px-2 ${eraFilter === 'all' ? 'active' : ''}`}>
                {isES ? 'Todas' : 'All'}
              </button>
              {eras.map(era => (
                <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip text-[0.5rem] py-0.5 px-2 ${eraFilter === era.id ? 'active' : ''}`}>
                  {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-cinzel text-[0.5rem] tracking-[0.2em] text-gold/60 uppercase mb-2">
              {isES ? 'Leyenda de Colores' : 'Color Legend'}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {eras.map(era => (
                <div key={era.id} className="flex items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ERA_COLORS[era.id as EraId] ?? '#C9A84C', flexShrink: 0 }} />
                  <span className="font-cinzel text-[0.45rem] tracking-wider text-smoke uppercase">{getEraName(lang, era.id as EraId, era.name)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
