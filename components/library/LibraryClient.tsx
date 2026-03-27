'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LIBRARY CLIENT
// Search + category filter + grid of documents
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import type { FlatDoc, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS } from '@/lib/data/helpers'

interface LibraryClientProps {
  docs: FlatDoc[]
  eras: { id: string; name: string }[]
  lang: Lang
}

const CATEGORIES = ['tratado', 'obra', 'documento', 'carta'] as const

export function LibraryClient({ docs, eras, lang }: LibraryClientProps) {
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')
  const [catFilter, setCatFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let res = docs
    if (eraFilter !== 'all') res = res.filter(d => d.eraId === eraFilter)
    if (catFilter !== 'all') res = res.filter(d => d.category === catFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(d => d.name.toLowerCase().includes(q) || d.year.toLowerCase().includes(q))
    }
    return res
  }, [docs, query, eraFilter, catFilter])

  const catLabel: Record<string, string> = {
    tratado: isES ? 'Tratados' : 'Treaties',
    obra: isES ? 'Obras' : 'Works',
    documento: isES ? 'Documentos' : 'Documents',
    carta: isES ? 'Cartas' : 'Letters',
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isES ? 'Buscar documento o año...' : 'Search document or year...'}
          className="w-full max-w-lg bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setCatFilter('all')} className={`chip ${catFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todos' : 'All'}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} className={`chip ${catFilter === cat ? 'active' : ''}`}>
            {catLabel[cat]}
          </button>
        ))}
      </div>

      {/* Era chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas las eras' : 'All eras'}
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {era.name}
          </button>
        ))}
      </div>

      <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-4">
        {filtered.length} {isES ? 'documentos' : 'documents'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ningún documento coincide.' : 'No documents match.'}
        </div>
      ) : (
        <div className="index-grid">
          {filtered.map((doc, i) => (
            <div key={i} className="card-bm flex items-start gap-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{doc.icon}</span>
              <div>
                <div className="font-playfair font-bold text-cream text-base leading-tight mb-1">{doc.name}</div>
                <div className="font-cinzel text-[0.5rem] tracking-[0.12em] text-smoke uppercase">{doc.year}</div>
                <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke/60 uppercase mt-0.5">{doc.eraName}</div>
                <div className="era-badge mt-2">{catLabel[doc.category]}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
