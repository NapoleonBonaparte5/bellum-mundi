'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TIMELINE SECTION
// Visual timeline → Era selector → Tabbed explorer + Map
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { Lang, Era, EraId } from '@/lib/data/types'
import { ERAS } from '@/lib/data/eras'
import { t } from '@/lib/i18n'
import { ERA_EMOJIS, ERA_COLORS, slugify, calcPowerScore } from '@/lib/data/helpers'

function useTypewriter(text: string, speed = 15) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

function useAnimatedNumber(target: number, active: boolean, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) { setValue(0); return }
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(2, -10 * p)
      setValue(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(step)
      else setValue(target)
    }
    requestAnimationFrame(step)
  }, [target, active, duration])
  return value
}

interface TimelineSectionProps {
  lang: Lang
}

type Tab = 'battles' | 'commanders' | 'weapons' | 'civs' | 'tactics' | 'docs'

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'battles',    labelKey: 'tabs.battles' },
  { id: 'commanders', labelKey: 'tabs.commanders' },
  { id: 'weapons',    labelKey: 'tabs.weapons' },
  { id: 'civs',       labelKey: 'tabs.civs' },
  { id: 'tactics',    labelKey: 'tabs.tactics' },
  { id: 'docs',       labelKey: 'tabs.docs' },
]

export function TimelineSection({ lang }: TimelineSectionProps) {
  const [activeEra, setActiveEra] = useState<Era | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('battles')
  const [battleSearch, setBattleSearch] = useState('')
  const [cmdSearch, setCmdSearch] = useState('')
  const [showMoreBattles, setShowMoreBattles] = useState(false)
  const [contentKey, setContentKey] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const eras = ERAS
  const activeIdx = activeEra ? eras.findIndex(e => e.id === activeEra.id) : -1
  const fillPct = activeIdx >= 0 ? (activeIdx / (eras.length - 1)) * 100 : 0

  const overviewText = useTypewriter(activeEra?.overview ?? '', 12)
  const statBattles = useAnimatedNumber(activeEra?.battles ?? 0, !!activeEra)
  const statDuration = useAnimatedNumber(activeEra ? (parseInt(activeEra.duration, 10) || 0) : 0, !!activeEra)
  const statCivs = useAnimatedNumber(activeEra?.civs_count ?? 0, !!activeEra)
  const statCmds = useAnimatedNumber(activeEra?.cmds ?? 0, !!activeEra)

  const selectEra = useCallback((era: Era) => {
    setActiveEra(era)
    setActiveTab('battles')
    setBattleSearch('')
    setCmdSearch('')
    setShowMoreBattles(false)
    setContentKey(k => k + 1)
    // Scroll content into view after state update
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
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
    <section id="timeline" className="py-8 px-4 md:px-8">
      {/* Section header */}
      <div className="text-center pb-8 pt-4 reveal visible">
        <div className="eyebrow mb-4">{t(lang, 'home.timeline.eyebrow')}</div>
        <h2 className="font-playfair font-bold text-cream mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          {t(lang, 'home.timeline.title')}
        </h2>
        <p className="font-crimson italic text-smoke text-lg max-w-xl mx-auto">
          {t(lang, 'home.timeline.desc')}
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
                      className={`vtl-dot${isActive ? ' vtl-dot-active' : ''}`}
                      style={isActive ? { background: ERA_COLORS[era.id as EraId], borderColor: ERA_COLORS[era.id as EraId], boxShadow: `0 0 16px ${ERA_COLORS[era.id as EraId]}80` } : {}}
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
              {activeEra ? activeEra.name : t(lang, 'home.timeline.selectEra')}
            </div>
            {activeEra && (
              <div className="font-crimson italic text-smoke text-sm mt-1">{activeEra.years}</div>
            )}
          </div>
        </div>

        {/* Era overview + stats */}
        {activeEra ? (
          <div ref={contentRef} key={contentKey} style={{ animation: 'fadeFromAbove 500ms cubic-bezier(0.4,0,0.2,1) both' }}>
            {/* Overview */}
            <p className="font-crimson text-parchment-dark text-lg leading-relaxed mb-6 max-w-4xl mx-auto text-center italic px-4 min-h-[3rem]">
              {overviewText}
              <span className="animate-pulse text-gold opacity-60">|</span>
            </p>

            {/* Quote */}
            <div className="text-center mb-6" style={{ animation: 'fadeIn 400ms ease 300ms both' }}>
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
                <div className="font-cinzel font-black text-3xl text-gold">{statBattles}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'home.eraStats.battles')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{statDuration}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'home.eraStats.years')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{statCivs}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'home.eraStats.civs')}</div>
              </div>
              <div className="bg-slate p-4 text-center">
                <div className="font-cinzel font-black text-3xl text-gold">{statCmds}</div>
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mt-1">{t(lang, 'home.eraStats.commanders')}</div>
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
                    {t(lang, tab.labelKey)}
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
                    placeholder={t(lang, 'tabs.searchBattlePh')}
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
                      {t(lang, 'tabs.showMore')} ({filteredBattles.length - 12} más)
                    </button>
                  )}
                </div>
              )}

              {/* COMMANDERS TAB */}
              {activeTab === 'commanders' && (
                <div>
                  <input
                    type="text"
                    placeholder={t(lang, 'tabs.searchCmdPh')}
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
                          style={{ width: `${calcPowerScore(c.metrics)}%`, background: ERA_COLORS[activeEra.id as EraId] }}
                        />
                      </div>
                      <div className="font-cinzel text-[0.45rem] tracking-[0.15em] text-smoke uppercase mt-1">
                        {lang === 'en' ? 'Military power' : 'Poder militar'}: {Math.round(calcPowerScore(c.metrics))}%
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
              {t(lang, 'home.timeline.eraPlaceholder')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
