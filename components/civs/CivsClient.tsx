'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATIONS CLIENT
// 7-metric power system with expandable radar panel
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatCivilization, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, calcPowerScore } from '@/lib/data/helpers'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, getCivName } from '@/lib/i18n'

interface CivsClientProps {
  civs: FlatCivilization[]
  eras: { id: string; name: string }[]
  lang: Lang
}

const METRIC_LABELS: Record<string, { es: string; en: string; tooltip_es: string; tooltip_en: string }> = {
  territory:  { es:'Territorio',   en:'Territory',   tooltip_es:'Extensión máxima en km² normalizada',              tooltip_en:'Maximum extent in km² normalized' },
  duration:   { es:'Duración',     en:'Duration',    tooltip_es:'Años de dominio militar activo',                   tooltip_en:'Years of active military dominance' },
  victories:  { es:'Victorias',    en:'Victories',   tooltip_es:'Porcentaje de conflictos documentados ganados',    tooltip_en:'Percentage of documented conflicts won' },
  innovation: { es:'Innovación',   en:'Innovation',  tooltip_es:'Innovaciones militares documentadas (armas/tácticas)', tooltip_en:'Documented military innovations' },
  projection: { es:'Proyección',   en:'Projection',  tooltip_es:'Capacidad de operar fuera de su región base',      tooltip_en:'Ability to project force beyond home region' },
  economy:    { es:'Economía',     en:'Economy',     tooltip_es:'Capacidad económica para sostener ejércitos',      tooltip_en:'Economic capacity to sustain armies' },
  legacy:     { es:'Legado',       en:'Legacy',      tooltip_es:'Influencia en doctrinas militares posteriores',    tooltip_en:'Influence on subsequent military doctrines' },
}

const METRIC_WEIGHTS: Record<string, number> = {
  territory:0.15, duration:0.15, victories:0.25, innovation:0.15, projection:0.15, economy:0.10, legacy:0.05,
}

function scoreColor(score: number): string {
  if (score >= 90) return '#F9F5ED'   // cream — white
  if (score >= 75) return '#C9A84C'   // gold
  if (score >= 60) return '#E87C3A'   // orange
  return '#C0392B'                    // red
}

export function CivsClient({ civs, eras, lang }: CivsClientProps) {
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'power'>('power')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  // expandedIdx kept for inline metric expand; cards also link to detail page

  const filtered = useMemo(() => {
    let res = civs
    if (eraFilter !== 'all') res = res.filter(c => c.eraId === eraFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(c => c.name.toLowerCase().includes(q) || c.period.toLowerCase().includes(q))
    }
    if (sortBy === 'power') res = [...res].sort((a, b) => b.powerScore - a.powerScore)
    else res = [...res].sort((a, b) => a.name.localeCompare(b.name))
    return res
  }, [civs, query, eraFilter, sortBy])

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isES ? 'Buscar civilización...' : 'Search civilization...'}
            className="w-full bg-slate border border-gold/20 pl-10 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'power')}
          className="bg-slate border border-gold/20 px-3 py-3 text-smoke font-cinzel text-[0.6rem] tracking-[0.1em] uppercase outline-none focus:border-gold/50 cursor-pointer"
        >
          <option value="power">{isES ? 'Por poder militar' : 'By military power'}</option>
          <option value="name">{isES ? 'Por nombre' : 'By name'}</option>
        </select>
      </div>

      {/* Era chips — horizontal scroll with arrows */}
      <ChipScroller className="mb-5">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas' : 'All'}
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
          </button>
        ))}
      </ChipScroller>

      {/* Result counter */}
      <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-5">
        <span className="text-gold font-bold text-sm mr-1.5">{filtered.length}</span>
        {isES ? 'civilizaciones' : 'civilizations'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ninguna civilización coincide.' : 'No civilizations match.'}
        </div>
      ) : (
        <div className="index-grid">
          {filtered.map((civ, i) => {
            const score = civ.powerScore
            const color = scoreColor(score)
            const isExpanded = expandedIdx === i
            return (
              <div key={i} className="card-bm select-none" style={{ position: 'relative' }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl leading-none">{civ.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-playfair font-bold text-cream text-base leading-tight">{getCivName(lang, civ.name)}</div>
                    <div className="font-cinzel text-[0.48rem] tracking-[0.1em] text-smoke uppercase mt-0.5">{civ.period}</div>
                  </div>
                  {/* Score badge */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-cinzel font-bold text-xl" style={{ color }}>{Math.round(score)}</div>
                    <div className="font-cinzel text-[0.4rem] tracking-[0.1em] text-smoke uppercase">score</div>
                  </div>
                </div>

                {/* Main power bar */}
                <div className="mb-3">
                  <div className="h-1.5 bg-ash rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${score}%`,
                        background: `linear-gradient(to right, var(--crimson), var(--gold-light))`,
                      }}
                    />
                  </div>
                </div>

                {/* Era + actions */}
                <div className="flex items-center justify-between mt-2">
                  <div className="font-cinzel text-[0.42rem] tracking-[0.1em] text-gold/60 uppercase">{getEraName(lang, civ.eraId as EraId, civ.eraName)}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.preventDefault(); setExpandedIdx(isExpanded ? null : i) }}
                      className="font-cinzel text-[0.42rem] tracking-[0.1em] text-smoke/50 uppercase hover:text-gold/60 transition-colors"
                    >
                      {isExpanded ? (isES ? '▲ cerrar' : '▲ close') : (isES ? '▼ métricas' : '▼ metrics')}
                    </button>
                    <Link
                      href={`/${lang}/civilizaciones/${civ.slug}`}
                      className="font-cinzel text-[0.42rem] tracking-[0.1em] text-gold/60 uppercase hover:text-gold transition-colors"
                    >
                      {isES ? '→ análisis' : '→ analysis'}
                    </Link>
                  </div>
                </div>

                {/* Expandable 7 metrics */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gold/10 space-y-2.5">
                    {Object.entries(civ.metrics).map(([key, val]) => {
                      const label = METRIC_LABELS[key]
                      const weight = METRIC_WEIGHTS[key]
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-cinzel text-[0.44rem] tracking-[0.1em] uppercase"
                                style={{ color: val >= 75 ? '#C9A84C' : val >= 50 ? '#9B9590' : '#6B6560' }}
                                title={isES ? label.tooltip_es : label.tooltip_en}
                              >
                                {isES ? label.es : label.en}
                              </span>
                              <span className="font-cinzel text-[0.36rem] text-smoke/40 uppercase">×{weight}</span>
                            </div>
                            <span className="font-cinzel text-[0.44rem] font-bold" style={{ color: val >= 75 ? '#C9A84C' : '#9B9590' }}>
                              {val}
                            </span>
                          </div>
                          <div className="h-1 bg-ash rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${val}%`,
                                background: val >= 80 ? 'var(--gold)' : val >= 60 ? '#E87C3A' : 'var(--crimson)',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
