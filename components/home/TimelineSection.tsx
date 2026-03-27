'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TIMELINE SECTION
// Visual timeline → Era selector → Tabbed explorer + Map
// ═══════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Lang, Era, EraId } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'
import { ERA_EMOJIS, ERA_COLORS, slugify } from '@/lib/data/helpers'

interface TimelineSectionProps {
  lang: Lang
  eras: Era[]
}

type Tab = 'battles' | 'commanders' | 'weapons' | 'civs' | 'tactics' | 'docs'

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'battles', labelKey: 'tab_battles' },
  { id: 'commanders', labelKey: 'tab_commanders' },
  { id: 'weapons', labelKey: 'tab_weapons' },
  { id: 'civs', labelKey: 'tab_civs' },
  { id: 'tactics', labelKey: 'tab_tactics' },
  { id: 'docs', labelKey: 'tab_docs' },
]

export function TimelineSection({ lang, eras }: TimelineSectionProps) {
  const [activeEra, setActiveEra] = useState<Era | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('battles')
  const [battleSearch, setBattleSearch] = useState('')
  const [cmdSearch, setCmdSearch] = useState('')
  const [showMoreBattles, setShowMoreBattles] = useState(false)

  const activeIdx = activeEra ? eras.findIndex(e => e.id === activeEra.id) : -1
  const fillPct = activeIdx >= 0 ? (activeIdx / (eras.length - 1)) * 100 : 0

  const selectEra = useCallback((era: Era) => {
    setActiveEra(era)
    setActiveTab('battles')
    setBattleSearch('')
    setCmdSearch('')
    setShowMoreBattles(false)
  }, [])

  // Filtered battles
  const filteredBattles = activeEra
    ? activeEra.battles_data.filter(b =>
        b.name.toLowerCase().includes(battleSearch.toLowerCase()) ||
        b.combatants.toLowerCase().includes(battleSearch.toLowerCase()) ||
        b.year.toLowerCase().includes(battleSearch.toLowerCase())
      )
    : []

  const visibleBattles = showMoreBattles ? filteredBattles : filteredBattles.slice(0, 12)

  // Filtered commanders
  const filteredCmds = activeEra
    ? activeEra.commanders.filter(c =>
        c.name.toLowerCase().includes(cmdSearch.toLowerCase()) ||
        c.role.toLowerCase().includes(cmdSearch.toLowerCase())
      )
    : []

  return (
    <section id="timeline" className="py-8 px-4">
      {/* Section header */}
      <div className="text-center pb-8 pt-4 reveal visible">
        <div className="eyebrow mb-4">{t(lang, 'timeline_eyebrow')}</div>
        <h2 className="font-playfair font-bold text-cream mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          {t(lang, 'timeline_title')}
        </h2>
        <p className="font-crimson italic text-smoke text-lg max-w-xl mx-auto">
          {t(lang, 'timeline_desc')}
        </p>
      </div>

      {/* Visual Timeline */}
      <div className="max-w-content mx-auto">
        <div className="vtl-wrap">
          <div className="vtl-track">
            <div className="vtl-fill" style={{ width: `${fillPct}%` }} />

            <div className="vtl-nodes">
              {eras.map((era, idx) => {
                const pct = (idx / (eras.length - 1)) * 100
                const isActive = activeEra?.id === era.id
                return (
                  <button
                    key={era.id}
                    className="vtl-node"
                    style={{ left: `${pct}%` }}
                    onClick={() => selectEra(era)}
                    title={era.name}
                    aria-pressed={isActive}
                  >
                    <div
                      className="vtl-dot"
                      style={isActive ? { background: ERA_COLORS[era.id as EraId], borderColor: ERA_COLORS[era.id as EraId] } : {}}
                    >
                      {ERA_EMOJIS[era.id as EraId]}
                    </div>
                    <div className="vtl-label font-cinzel text-[0.48rem] tracking-[0.1em] text-smoke mt-1 whitespace-nowrap"
                      style={{ marginTop: idx % 2 === 0 ? '-3.5rem' : '0.5rem' }}
                    >
                      {era.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Era name display */}
          <div className="mt-6 text-center">
            <div className="font-cinzel text-sm tracking-[0.2em] text-gold">
              {activeEra ? activeEra.name : t(lang, 'vtl_placeholder')}
            </div>
            {activeEra && (
              <div className="font-crimson italic text-smoke text-sm mt-1">{activeEra.years}</div>
            )}
          </div>
        </div>

        {/* Era overview + stats */}
        {activeEra ? (
          <div>
            {/* Overview */}
            <p className="font-crimson text-parchment-dark text-lg leading-relaxed mb-6 max-w-4xl mx-auto text-center italic px-4">
              {activeEra.overview}
            </p>

            {/* Quote */}
            <div className="text-center mb-6">
              <blockquote className="font-fell italic text-parchment-dark text-xl">
                &ldquo;{activeEra.quote.text}&rdquo;
              </blockquote>
              <cite className="font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke not-italic mt-2 block">
                {activeEra.quote.attr}
              </cite>
            </div>

            {/* Stats */}
            <div className="stats-row mb-6">
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{activeEra.battles}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'stat_label_battles')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{activeEra.duration}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'stat_label_years')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{activeEra.civs_count}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'stat_label_civs')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{activeEra.cmds}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'stat_label_cmds')}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-slate mb-1">
              <div className="flex overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`font-cinzel text-[0.58rem] tracking-[0.15em] px-4 py-3 whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'text-gold border-gold bg-gold/5'
                        : 'text-smoke border-transparent hover:text-mist'
                    }`}
                  >
                    {t(lang, tab.labelKey as any)}
                    <span className="ml-1 text-smoke">
                      {tab.id === 'battles' && activeEra.battles_data.length}
                      {tab.id === 'commanders' && activeEra.commanders.length}
                      {tab.id === 'weapons' && activeEra.weapons.length}
                      {tab.id === 'civs' && activeEra.civs.length}
                      {tab.id === 'tactics' && activeEra.tactics.length}
                      {tab.id === 'docs' && activeEra.docs.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-steel p-4">

              {/* BATTLES TAB */}
              {activeTab === 'battles' && (
                <div>
                  <input
                    type="text"
                    placeholder={t(lang, 'search_battle_ph')}
                    value={battleSearch}
                    onChange={e => { setBattleSearch(e.target.value); setShowMoreBattles(false) }}
                    className="w-full bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 mb-4 placeholder:text-smoke"
                  />
                  <div className="battles-grid">
                    {visibleBattles.map((b, i) => (
                      <Link
                        key={i}
                        href={`/${lang}/batallas/${slugify(b.name)}`}
                        className="card-bm block"
                      >
                        <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-1">{b.year}</div>
                        <div className="font-playfair font-bold text-cream text-lg leading-tight mb-1">{b.name}</div>
                        <div className="font-crimson text-smoke text-sm">{b.combatants}</div>
                        {b.tag && (
                          <div className="era-badge mt-2">{b.tag}</div>
                        )}
                      </Link>
                    ))}
                    {filteredBattles.length === 0 && (
                      <div className="col-span-full py-8 text-center text-smoke font-crimson italic">
                        {lang === 'en' ? 'No battles match your search.' : 'Ninguna batalla coincide con tu búsqueda.'}
                      </div>
                    )}
                  </div>
                  {filteredBattles.length > 12 && !showMoreBattles && (
                    <button
                      onClick={() => setShowMoreBattles(true)}
                      className="mt-4 font-cinzel text-[0.6rem] tracking-[0.2em] text-gold hover:text-gold-light transition-colors uppercase w-full py-3 border border-gold/20 hover:border-gold/40"
                    >
                      {t(lang, 'show_more')} ({filteredBattles.length - 12} más)
                    </button>
                  )}
                </div>
              )}

              {/* COMMANDERS TAB */}
              {activeTab === 'commanders' && (
                <div>
                  <input
                    type="text"
                    placeholder={t(lang, 'search_cmd_ph')}
                    value={cmdSearch}
                    onChange={e => setCmdSearch(e.target.value)}
                    className="w-full bg-slate border border-gold/20 px-4 py-3 text-cream font-crimson text-base outline-none focus:border-gold/50 mb-4 placeholder:text-smoke"
                  />
                  <div className="commanders-grid">
                    {filteredCmds.map((c, i) => (
                      <Link
                        key={i}
                        href={`/${lang}/comandantes/${slugify(c.name)}`}
                        className="card-bm block text-center py-6"
                      >
                        <div className="text-3xl mb-2">{c.emoji}</div>
                        <div className="font-playfair font-bold text-cream text-base leading-tight mb-1">{c.name}</div>
                        <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">{c.role}</div>
                      </Link>
                    ))}
                    {filteredCmds.length === 0 && (
                      <div className="col-span-full py-8 text-center text-smoke font-crimson italic">
                        {lang === 'en' ? 'No commanders match your search.' : 'Ningún comandante coincide.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WEAPONS TAB */}
              {activeTab === 'weapons' && (
                <div className="index-grid">
                  {activeEra.weapons.map((w, i) => (
                    <div key={i} className="card-bm flex items-center gap-4">
                      <span className="text-2xl flex-shrink-0">{w.icon}</span>
                      <div>
                        <div className="font-playfair font-bold text-cream text-base">{w.name}</div>
                        <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mt-0.5">{w.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CIVS TAB */}
              {activeTab === 'civs' && (
                <div className="index-grid">
                  {activeEra.civs.map((c, i) => (
                    <div key={i} className="card-bm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="font-playfair font-bold text-cream text-base">{c.name}</div>
                          <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">{c.period}</div>
                        </div>
                      </div>
                      {/* Power bar */}
                      <div className="h-1 bg-ash rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${c.power * 100}%`, background: ERA_COLORS[activeEra.id as EraId] }}
                        />
                      </div>
                      <div className="font-cinzel text-[0.45rem] tracking-[0.15em] text-smoke uppercase mt-1">
                        {lang === 'en' ? 'Military power' : 'Poder militar'}: {Math.round(c.power * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TACTICS TAB */}
              {activeTab === 'tactics' && (
                <div className="index-grid">
                  {activeEra.tactics.map((tac, i) => (
                    <div key={i} className="card-bm flex items-center gap-4">
                      <span className="text-2xl flex-shrink-0">{tac.icon}</span>
                      <div>
                        <div className="font-playfair font-bold text-cream text-base">{tac.name}</div>
                        <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mt-0.5">{tac.origin}</div>
                      </div>
                    </div>
                  ))}
                  {activeEra.tactics.length === 0 && (
                    <div className="col-span-full py-8 text-center text-smoke font-crimson italic">
                      {lang === 'en' ? 'No tactics recorded for this era.' : 'Sin tácticas registradas para esta era.'}
                    </div>
                  )}
                </div>
              )}

              {/* DOCS TAB */}
              {activeTab === 'docs' && (
                <div className="index-grid">
                  {activeEra.docs.map((d, i) => (
                    <div key={i} className="card-bm flex items-center gap-4">
                      <span className="text-2xl flex-shrink-0">{d.icon}</span>
                      <div>
                        <div className="font-playfair font-bold text-cream text-base">{d.name}</div>
                        <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mt-0.5">{d.year}</div>
                      </div>
                    </div>
                  ))}
                  {activeEra.docs.length === 0 && (
                    <div className="col-span-full py-8 text-center text-smoke font-crimson italic">
                      {lang === 'en' ? 'No documents recorded for this era.' : 'Sin documentos registrados para esta era.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="bg-slate/40 border border-gold/10 p-12 text-center mt-8">
            <div className="text-4xl mb-4">⚔</div>
            <p className="font-crimson italic text-smoke text-lg">
              {t(lang, 'era_overview_placeholder')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
