'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LIBRARY CLIENT
// Search + category filter + grid of documents
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatDoc, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS } from '@/lib/data/helpers'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, translateYear, getDocName } from '@/lib/i18n'

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
    tratado: isES ? 'Tratado' : 'Treaty',
    obra: isES ? 'Obra' : 'Work',
    documento: isES ? 'Documento' : 'Document',
    carta: isES ? 'Carta' : 'Letter',
  }

  return (
    <div>
      {/* Search with icon */}
      <div className="mb-5">
        <div className="relative w-full max-w-lg">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isES ? 'Buscar documento o año...' : 'Search document or year...'}
            className="w-full bg-slate border border-gold/20 pl-10 pr-10 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-gold text-lg transition-colors">×</button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <ChipScroller className="mb-4">
        <button onClick={() => setCatFilter('all')} className={`chip ${catFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todos' : 'All'}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} className={`chip ${catFilter === cat ? 'active' : ''}`}>
            {catLabel[cat]}s
          </button>
        ))}
      </ChipScroller>

      {/* Era chips — horizontal scroll with arrows */}
      <ChipScroller className="mb-5">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas las eras' : 'All eras'}
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
          </button>
        ))}
      </ChipScroller>

      {/* Result counter */}
      <div className="font-cinzel text-[0.72rem] tracking-[0.2em] text-smoke uppercase mb-5">
        <span className="text-gold font-bold text-sm mr-1.5">{filtered.length}</span>
        {isES ? 'documentos' : 'documents'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ningún documento coincide.' : 'No documents match.'}
        </div>
      ) : (
        <div className="index-grid">
          {filtered.map((doc, i) => (
            <Link key={i} href={`/${lang}/biblioteca/${doc.slug}`} className="card-bm flex items-start gap-4">
              <span className="text-2xl flex-shrink-0 mt-0.5">{doc.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-playfair font-bold text-cream text-lg leading-tight mb-1">{getDocName(lang, doc.name)}</div>
                <div className="font-cinzel text-sm tracking-[0.12em] text-smoke uppercase">{translateYear(lang, doc.year)}</div>
                <div className="font-cinzel text-[0.7rem] tracking-[0.1em] text-smoke/60 uppercase mt-0.5">{getEraName(lang, doc.eraId as EraId, doc.eraName)}</div>
                <div className={`doc-badge doc-badge-${doc.category} mt-2`}>{catLabel[doc.category]}</div>
                <div className="font-cinzel text-[0.7rem] tracking-[0.1em] text-gold/50 uppercase mt-2">
                  {isES ? '⚡ Analizar con IA →' : '⚡ Analyze with AI →'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
