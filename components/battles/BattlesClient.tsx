'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLES CLIENT
// Search + era filter + comparison mode + grid/list toggle
// ═══════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { getAllBattles, ERA_EMOJIS } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, getTagName, translateCombatants, translateYear, getBattleName, autoTranslateDesc } from '@/lib/i18n'

interface BattlesClientProps {
  lang: Lang
}

const PAGE_SIZE = 48

export function BattlesClient({ lang }: BattlesClientProps) {
  const battles = useMemo(() => getAllBattles(), [])
  const eras = useMemo(() => ERAS.map(e => ({ id: e.id, name: e.name })), [])
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<FlatBattle[]>([])
  const [listView, setListView] = useState(false)

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
      if (prev.find(b => b.slug === battle.slug)) return prev.filter(b => b.slug !== battle.slug)
      if (prev.length >= 2) return prev
      return [...prev, battle]
    })
  }

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Search with icon */}
        <div className="relative flex-1 min-w-[240px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50 pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1) }}
            placeholder={isES ? 'Buscar batalla, año, combatiente...' : 'Search battle, year, combatant...'}
            className="search-bm w-full bg-slate border border-gold/20 pl-10 pr-10 py-3 text-cream font-crimson text-base outline-none placeholder:text-smoke transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-gold text-lg transition-colors"
              aria-label="Clear search"
            >×</button>
          )}
        </div>

        {/* Grid/list toggle */}
        <div className="flex border border-gold/20 flex-shrink-0">
          <button
            onClick={() => setListView(false)}
            className={`px-3 py-3 transition-colors ${!listView ? 'bg-gold/10 text-gold' : 'text-smoke hover:text-mist'}`}
            title={isES ? 'Vista cuadrícula' : 'Grid view'}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7"/><rect x="9" y="0" width="7" height="7"/>
              <rect x="0" y="9" width="7" height="7"/><rect x="9" y="9" width="7" height="7"/>
            </svg>
          </button>
          <button
            onClick={() => setListView(true)}
            className={`px-3 py-3 transition-colors border-l border-gold/20 ${listView ? 'bg-gold/10 text-gold' : 'text-smoke hover:text-mist'}`}
            title={isES ? 'Vista lista' : 'List view'}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="1" width="16" height="2"/><rect x="0" y="7" width="16" height="2"/>
              <rect x="0" y="13" width="16" height="2"/>
            </svg>
          </button>
        </div>

        {/* Compare mode toggle */}
        <button
          onClick={() => { setCompareMode(c => !c); setSelected([]) }}
          className={`font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-4 py-3 border transition-colors flex-shrink-0 ${
            compareMode ? 'bg-gold/10 border-gold text-gold' : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
          }`}
        >
          ⚖ {isES ? 'Comparar' : 'Compare'}
        </button>
      </div>

      {/* Era filter chips — horizontal scroll with arrows */}
      <ChipScroller className="mb-6">
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
            {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
          </button>
        ))}
      </ChipScroller>

      {/* Animated result counter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="font-cinzel tracking-[0.15em] uppercase flex items-center gap-2">
          <span className="text-gold font-bold text-lg">{filtered.length}</span>
          <span className="text-mist text-[0.72rem]">{isES ? 'batallas encontradas' : 'battles found'}</span>
          {compareMode && selected.length > 0 && (
            <span className="text-gold text-[0.72rem]">
              · {selected.length}/2 {isES ? 'seleccionadas' : 'selected'}
            </span>
          )}
        </div>
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
                <div className="font-cinzel text-[0.72rem] tracking-[0.15em] text-smoke uppercase mb-1">{b.year}</div>
                <div className="font-playfair font-bold text-cream text-xl">{b.name}</div>
                <div className="font-crimson text-smoke text-sm mt-1">{b.combatants}</div>
                <div className="font-crimson text-parchment-dark text-sm mt-2">{b.desc}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelected([])}
            className="mt-4 font-cinzel text-[0.72rem] tracking-[0.15em] text-smoke hover:text-gold uppercase"
          >
            {isES ? 'Limpiar selección' : 'Clear selection'}
          </button>
        </div>
      )}

      {/* Grid or List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ninguna batalla coincide con tu búsqueda.' : 'No battles match your search.'}
        </div>
      ) : (
        <>
          <div className={listView ? 'battles-list' : 'battles-grid'}>
            {visible.map((battle) => {
              const isSelectedBattle = selected.find(b => b.slug === battle.slug)
              return (
                <div key={battle.slug} className="relative">
                  {compareMode ? (
                    <button
                      onClick={() => toggleSelect(battle)}
                      className={`card-bm block w-full text-left ${listView ? 'flex items-center gap-6' : ''} ${isSelectedBattle ? 'ring-1 ring-gold bg-gold/5' : ''}`}
                      disabled={!isSelectedBattle && selected.length >= 2}
                    >
                      <BattleCard battle={battle} listView={listView} lang={lang} />
                      {isSelectedBattle && (
                        <div className="absolute top-2 right-2 bg-gold text-ink font-cinzel text-[0.45rem] tracking-[0.1em] px-1.5 py-0.5 font-bold uppercase">✓</div>
                      )}
                    </button>
                  ) : (
                    <Link href={`/${lang}/batallas/${battle.slug}`} className={`card-bm block ${listView ? 'flex items-center gap-6' : ''}`}>
                      <BattleCard battle={battle} listView={listView} lang={lang} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

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

function BattleCard({ battle, listView, lang }: { battle: FlatBattle; listView: boolean; lang: Lang }) {
  if (listView) {
    return (
      <div className="flex items-center gap-5 w-full">
        <div className="font-cinzel text-gold font-bold text-sm w-16 flex-shrink-0">{translateYear(lang, battle.year)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-playfair font-bold text-cream text-base leading-tight">{getBattleName(lang, battle.name)}</div>
          <div className="font-crimson text-smoke text-sm">{translateCombatants(lang, battle.combatants)}</div>
        </div>
        {battle.tag && <div className="era-badge flex-shrink-0 hidden sm:block">{getTagName(lang, battle.tag)}</div>}
      </div>
    )
  }
  return (
    <>
      <div className="card-year">{translateYear(lang, battle.year)}</div>
      <div className="card-title line-clamp-2">{getBattleName(lang, battle.name)}</div>
      <div className="card-combatants">{translateCombatants(lang, battle.combatants)}</div>
      {battle.desc && (
        <div className="card-desc line-clamp-2">{autoTranslateDesc(battle.desc, lang)}</div>
      )}
      {battle.tag && (
        <div className="era-badge-wrapper">
          <div className="era-badge">{getTagName(lang, battle.tag)}</div>
        </div>
      )}
    </>
  )
}
