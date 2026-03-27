'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLES CLIENT
// Search + era filter + comparison mode + grid
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { getAllBattles, ERA_EMOJIS } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'

interface BattlesClientProps {
  lang: Lang
}

const PAGE_SIZE = 48

export function BattlesClient({ lang }: BattlesClientProps) {
  // Load data directly — avoids large server→client prop serialization
  const battles = useMemo(() => getAllBattles(), [])
  const eras = useMemo(() => ERAS.map(e => ({ id: e.id, name: e.name })), [])
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<FlatBattle[]>([])

  // Filter + search
  const filtered = useMemo(() => {
    let res = battles
    if (eraFilter !== 'all') res = res.filter(b => b.eraId === eraFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      res = res.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.combatants.toLowerCase().includes(q) ||
        b.year.toLowerCase().includes(q) ||
        (b.tag ?? '').toLowerCase().includes(q)
      )
    }
    return res
  }, [battles, query, eraFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible = filtered.slice(0, page * PAGE_SIZE)

  function toggleSelect(battle: FlatBattle) {
    setSelected(prev => {
      if (prev.find(b => b.slug === battle.slug)) {
        return prev.filter(b => b.slug !== battle.slug)
      }
      if (prev.length >= 2) return prev
      return [...prev, battle]
    })
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder={isES ? 'Buscar batalla, año, combatiente...' : 'Search battle, year, combatant...'}
            className="w-full bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 placeholder:text-smoke"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-gold text-lg"
              aria-label="Clear search"
            >×</button>
          )}
        </div>

        {/* Compare mode toggle */}
        <button
          onClick={() => { setCompareMode(c => !c); setSelected([]) }}
          className={`font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-4 py-3 border transition-colors flex-shrink-0 ${
            compareMode
              ? 'bg-gold/10 border-gold text-gold'
              : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
          }`}
        >
          ⚖ {isES ? 'Comparar' : 'Compare'}
        </button>
      </div>

      {/* Era filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setEraFilter('all'); setPage(1) }}
          className={`chip ${eraFilter === 'all' ? 'active' : ''}`}
        >
          {isES ? 'Todas' : 'All'}
        </button>
        {eras.map(era => (
          <button
            key={era.id}
            onClick={() => { setEraFilter(era.id); setPage(1) }}
            className={`chip ${eraFilter === era.id ? 'active' : ''}`}
          >
            {ERA_EMOJIS[era.id as EraId]} {era.name}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-4">
        {filtered.length} {isES ? 'batallas' : 'battles'}
        {compareMode && selected.length > 0 && (
          <span className="ml-3 text-gold">
            · {selected.length}/2 {isES ? 'seleccionadas' : 'selected'}
          </span>
        )}
      </div>

      {/* Compare panel */}
      {compareMode && selected.length === 2 && (
        <div className="mb-6 bg-slate border border-gold/30 p-6">
          <div className="font-cinzel text-[0.6rem] tracking-[0.2em] text-gold uppercase mb-4">
            ⚖ {isES ? 'Comparación' : 'Comparison'}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {selected.map(b => (
              <div key={b.slug}>
                <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mb-1">{b.year}</div>
                <div className="font-playfair font-bold text-cream text-xl">{b.name}</div>
                <div className="font-crimson text-smoke text-sm mt-1">{b.combatants}</div>
                <div className="font-crimson text-parchment-dark text-sm mt-2">{b.desc}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelected([])}
            className="mt-4 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke hover:text-gold uppercase"
          >
            {isES ? 'Limpiar selección' : 'Clear selection'}
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ninguna batalla coincide con tu búsqueda.' : 'No battles match your search.'}
        </div>
      ) : (
        <>
          <div className="battles-grid">
            {visible.map((battle) => {
              const isSelectedBattle = selected.find(b => b.slug === battle.slug)
              return (
                <div key={battle.slug} className="relative">
                  {compareMode ? (
                    <button
                      onClick={() => toggleSelect(battle)}
                      className={`card-bm block w-full text-left ${isSelectedBattle ? 'ring-1 ring-gold bg-gold/5' : ''}`}
                      disabled={!isSelectedBattle && selected.length >= 2}
                    >
                      <BattleCard battle={battle} />
                      {isSelectedBattle && (
                        <div className="absolute top-2 right-2 bg-gold text-ink font-cinzel text-[0.45rem] tracking-[0.1em] px-1.5 py-0.5 font-bold uppercase">✓</div>
                      )}
                    </button>
                  ) : (
                    <Link href={`/${lang}/batallas/${battle.slug}`} className="card-bm block">
                      <BattleCard battle={battle} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* Load more */}
          {visible.length < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="font-cinzel text-[0.6rem] tracking-[0.2em] text-gold hover:text-gold-light uppercase border border-gold/30 hover:border-gold px-8 py-3 transition-colors"
              >
                {isES
                  ? `Cargar más — ${filtered.length - visible.length} restantes`
                  : `Load more — ${filtered.length - visible.length} remaining`
                }
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BattleCard({ battle }: { battle: FlatBattle }) {
  return (
    <>
      <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mb-1">{battle.year}</div>
      <div className="font-playfair font-bold text-cream text-lg leading-tight mb-1">{battle.name}</div>
      <div className="font-crimson text-smoke text-sm">{battle.combatants}</div>
      {battle.desc && (
        <div className="font-crimson text-parchment-dark/70 text-sm mt-2 line-clamp-2">{battle.desc}</div>
      )}
      {battle.tag && <div className="era-badge mt-3">{battle.tag}</div>}
    </>
  )
}
