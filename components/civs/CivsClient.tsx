'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATIONS CLIENT
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import type { FlatCivilization, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, ERA_COLORS } from '@/lib/data/helpers'

interface CivsClientProps {
  civs: FlatCivilization[]
  eras: { id: string; name: string }[]
  lang: Lang
}

export function CivsClient({ civs, eras, lang }: CivsClientProps) {
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'power'>('power')

  const filtered = useMemo(() => {
    let res = civs
    if (eraFilter !== 'all') res = res.filter(c => c.eraId === eraFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(c => c.name.toLowerCase().includes(q) || c.period.toLowerCase().includes(q))
    }
    if (sortBy === 'power') res = [...res].sort((a, b) => b.power - a.power)
    else res = [...res].sort((a, b) => a.name.localeCompare(b.name))
    return res
  }, [civs, query, eraFilter, sortBy])

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isES ? 'Buscar civilización...' : 'Search civilization...'}
          className="flex-1 min-w-[200px] bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'power')}
          className="bg-slate border border-gold/20 px-3 py-3 text-smoke font-cinzel text-[0.6rem] tracking-[0.1em] uppercase outline-none focus:border-gold/50 cursor-pointer"
        >
          <option value="power">{isES ? 'Por poder militar' : 'By military power'}</option>
          <option value="name">{isES ? 'Por nombre' : 'By name'}</option>
        </select>
      </div>

      {/* Era chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas' : 'All'}
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {era.name}
          </button>
        ))}
      </div>

      <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-4">
        {filtered.length} {isES ? 'civilizaciones' : 'civilizations'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ninguna civilización coincide.' : 'No civilizations match.'}
        </div>
      ) : (
        <div className="index-grid">
          {filtered.map((civ, i) => (
            <div key={i} className="card-bm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{civ.flag}</span>
                <div>
                  <div className="font-playfair font-bold text-cream text-base leading-tight">{civ.name}</div>
                  <div className="font-cinzel text-[0.48rem] tracking-[0.1em] text-smoke uppercase mt-0.5">{civ.period}</div>
                </div>
              </div>
              {/* Power bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke uppercase">
                    {isES ? 'Poder militar' : 'Military power'}
                  </div>
                  <div className="font-cinzel text-[0.5rem] text-gold font-bold">
                    {Math.round(civ.power * 100)}%
                  </div>
                </div>
                <div className="h-1.5 bg-ash rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${civ.power * 100}%`,
                      background: ERA_COLORS[civ.eraId as EraId] ?? 'var(--gold)',
                    }}
                  />
                </div>
              </div>
              <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke/60 uppercase">{civ.eraName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
