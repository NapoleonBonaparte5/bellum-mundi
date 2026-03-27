'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS CLIENT
// Search + era filter + grid
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatCommander, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS } from '@/lib/data/helpers'

interface CommandersClientProps {
  commanders: FlatCommander[]
  eras: { id: string; name: string }[]
  lang: Lang
}

export function CommandersClient({ commanders, eras, lang }: CommandersClientProps) {
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
      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isES ? 'Buscar comandante o rol...' : 'Search commander or role...'}
            className="w-full bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-gold text-lg">×</button>
          )}
        </div>
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
        {filtered.length} {isES ? 'comandantes' : 'commanders'}
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
              className="card-bm block text-center py-8"
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <div className="font-playfair font-bold text-cream text-base leading-tight mb-1">{c.name}</div>
              <div className="font-cinzel text-[0.48rem] tracking-[0.12em] text-smoke uppercase">{c.role}</div>
              <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke/60 uppercase mt-1">{c.eraName}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
