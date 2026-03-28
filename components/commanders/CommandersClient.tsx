'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS CLIENT
// Search + era filter + grid
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatCommander, Lang, EraId } from '@/lib/data/types'
import { getAllCommanders, ERA_EMOJIS } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, getRoleName, getCmdName } from '@/lib/i18n'

interface CommandersClientProps {
  lang: Lang
}

export function CommandersClient({ lang }: CommandersClientProps) {
  const commanders = useMemo(() => getAllCommanders(), [])
  const eras = useMemo(() => ERAS.map(e => ({ id: e.id, name: e.name })), [])
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')

  const filtered = useMemo(() => {
    let res = commanders
    if (eraFilter !== 'all') res = res.filter(c => c.eraId === eraFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      )
    }
    return res
  }, [commanders, query, eraFilter])

  return (
    <div>
      {/* Search with icon */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isES ? 'Buscar comandante o rol...' : 'Search commander or role...'}
            className="w-full bg-slate border border-gold/20 pl-10 pr-10 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-gold text-lg transition-colors">×</button>
          )}
        </div>
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
        {isES ? 'comandantes' : 'commanders'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ningún comandante coincide.' : 'No commanders match.'}
        </div>
      ) : (
        <div className="commanders-grid">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={`/${lang}/comandantes/${c.slug}`}
              className="card-bm commander-card"
            >
              <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.75rem' }}>{c.emoji}</div>
              <div className="font-playfair font-bold text-cream text-base leading-tight mb-1 line-clamp-2 text-center px-2">{getCmdName(lang, c.name)}</div>
              <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-gold uppercase mt-1 text-center">{getEraName(lang, c.eraId as EraId, c.eraName ?? '')}</div>
              <div className="font-cinzel text-[0.44rem] tracking-[0.1em] text-smoke/70 uppercase mt-1 line-clamp-2 text-center px-2">{getRoleName(lang, c.role)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
