'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATIONS CLIENT (4A + 4B)
// Mini metric bars always visible + "Enfrentar" AI modal
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { FlatCivilization, Lang, EraId } from '@/lib/data/types'
import { ERA_EMOJIS, calcPowerScore } from '@/lib/data/helpers'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, getCivName, translateYear } from '@/lib/i18n'
import { processContent } from '@/lib/utils/processContent'

interface CivsClientProps {
  civs: FlatCivilization[]
  eras: { id: string; name: string }[]
  lang: Lang
}

const METRIC_LABELS: Record<string, { es: string; en: string; tooltip_es: string; tooltip_en: string }> = {
  territory:  { es:'Territorio',   en:'Territory',   tooltip_es:'Extensión máxima en km² normalizada',              tooltip_en:'Maximum extent in km² normalized' },
  duration:   { es:'Duración',     en:'Duration',    tooltip_es:'Años de dominio militar activo',                   tooltip_en:'Years of active military dominance' },
  victories:  { es:'Victorias',    en:'Victories',   tooltip_es:'Porcentaje de conflictos documentados ganados',    tooltip_en:'Percentage of documented conflicts won' },
  innovation: { es:'Innovación',   en:'Innovation',  tooltip_es:'Innovaciones militares documentadas',              tooltip_en:'Documented military innovations' },
  projection: { es:'Proyección',   en:'Projection',  tooltip_es:'Capacidad de operar fuera de su región base',      tooltip_en:'Ability to project force beyond home region' },
  economy:    { es:'Economía',     en:'Economy',     tooltip_es:'Capacidad económica para sostener ejércitos',      tooltip_en:'Economic capacity to sustain armies' },
  legacy:     { es:'Legado',       en:'Legacy',      tooltip_es:'Influencia en doctrinas militares posteriores',    tooltip_en:'Influence on subsequent military doctrines' },
}

function scoreColor(score: number): string {
  if (score >= 90) return '#F9F5ED'
  if (score >= 75) return '#C9A84C'
  if (score >= 60) return '#E87C3A'
  return '#C0392B'
}

// ── Battle simulation modal (4B) ─────────────────────────
function BattleModal({
  civ1,
  civ2,
  lang,
  onClose,
}: {
  civ1: FlatCivilization
  civ2: FlatCivilization
  lang: Lang
  onClose: () => void
}) {
  const isES = lang === 'es'
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click or Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const run = useCallback(async () => {
    if (loading || started) return
    window.scrollTo({ top: 0 })
    setStarted(true)
    setLoading(true)
    setContent('')

    const prompt = isES
      ? `Simulación histórica: ¿Qué habría pasado si ${getCivName(lang, civ1.name)} y ${getCivName(lang, civ2.name)} hubieran combatido en su apogeo? Analiza: fuerzas militares, tácticas, logística, terreno probable y resultado más probable. Sé concreto y riguroso. Máximo 400 palabras.`
      : `Historical simulation: What would have happened if ${civ1.name} and ${civ2.name} had fought at their peak? Analyze: military forces, tactics, logistics, probable terrain and most likely outcome. Be concrete and rigorous. Maximum 400 words.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          lang,
          tutorMode: false,
        }),
      })
      if (!res.ok || !res.body) { setLoading(false); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setContent(processContent(acc))
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [civ1, civ2, lang, isES, loading, started])

  // Auto-run on mount
  useEffect(() => { run() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[800] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="bg-slate border border-gold/30 w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{civ1.flag}</span>
            <span className="font-cinzel text-gold text-xs tracking-wider">⚔ VS</span>
            <span className="text-2xl">{civ2.flag}</span>
            <div>
              <p className="font-cinzel text-[0.5rem] tracking-[0.25em] text-gold/60 uppercase">
                {isES ? 'Simulación Histórica IA' : 'AI Historical Simulation'}
              </p>
              <p className="font-playfair font-bold text-cream text-base">
                {getCivName(lang, civ1.name)} vs {getCivName(lang, civ2.name)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-smoke hover:text-gold transition-colors text-xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && !content && (
            <div className="flex items-center gap-3 py-8">
              <div className="loading-dots"><span /><span /><span /></div>
              <span className="font-cinzel text-[0.55rem] tracking-widest text-smoke/60 uppercase">
                {isES ? 'Simulando batalla histórica...' : 'Simulating historical battle...'}
              </span>
            </div>
          )}
          {content && (
            <div
              className="ai-content font-crimson text-parchment-dark text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gold/10 flex-shrink-0">
          <p className="font-cinzel text-[0.45rem] tracking-widest text-smoke/40 uppercase">
            {isES ? '✦ Generado con Claude AI · Solo para fines educativos' : '✦ Generated with Claude AI · For educational purposes only'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export function CivsClient({ civs, eras, lang }: CivsClientProps) {
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'power'>('power')

  // Battle simulation state (4B)
  const [battlePick, setBattlePick] = useState<FlatCivilization[]>([])
  const [battleModal, setBattleModal] = useState(false)

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

  const handleEnfrentar = (civ: FlatCivilization, e: React.MouseEvent) => {
    e.preventDefault()
    setBattlePick(prev => {
      if (prev.find(c => c.slug === civ.slug)) return prev.filter(c => c.slug !== civ.slug)
      if (prev.length >= 2) return [civ]
      const next = [...prev, civ]
      if (next.length === 2) { setBattleModal(true) }
      return next
    })
  }

  const clearBattle = () => { setBattlePick([]); setBattleModal(false) }

  return (
    <div>
      {/* Battle pick indicator */}
      {battlePick.length > 0 && (
        <div className="mb-4 px-4 py-3 border border-gold/30 bg-slate/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {battlePick.map(c => (
              <div key={c.slug} className="flex items-center gap-1.5">
                <span className="text-lg">{c.flag}</span>
                <span className="font-cinzel text-gold text-xs tracking-wider">{getCivName(lang, c.name)}</span>
              </div>
            ))}
            {battlePick.length === 1 && (
              <span className="font-cinzel text-smoke text-[0.55rem] tracking-wider uppercase">
                {isES ? '← Selecciona una segunda civilización' : '← Select a second civilization'}
              </span>
            )}
          </div>
          <button onClick={clearBattle} className="font-cinzel text-smoke hover:text-gold text-[0.55rem] tracking-wider uppercase transition-colors">
            {isES ? '✕ Limpiar' : '✕ Clear'}
          </button>
        </div>
      )}

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

      {/* Era chips */}
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
      <div className="font-cinzel text-[0.72rem] tracking-[0.2em] text-smoke uppercase mb-5">
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
            const isPicked = battlePick.find(c => c.slug === civ.slug)

            return (
              <div
                key={i}
                className="card-bm select-none"
                style={{
                  position: 'relative',
                  outline: isPicked ? `2px solid var(--gold)` : 'none',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl leading-none">{civ.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-playfair font-bold text-cream text-xl leading-tight">{getCivName(lang, civ.name)}</div>
                    <div className="font-cinzel text-sm tracking-[0.1em] text-smoke uppercase mt-0.5">{translateYear(lang, civ.period)}</div>
                  </div>
                  {/* Score badge */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-cinzel font-bold text-xl" style={{ color }}>{Math.round(score)}</div>
                    <div className="font-cinzel text-[0.7rem] tracking-[0.1em] text-smoke uppercase">score</div>
                  </div>
                </div>

                {/* Mini metric bars — always visible (4A) */}
                <div className="space-y-1 mb-3">
                  {Object.entries(civ.metrics ?? {}).slice(0, 4).map(([key, val]) => {
                    const label = METRIC_LABELS[key]
                    if (!label) return null
                    return (
                      <div key={key} className="flex items-center gap-2" title={isES ? label.tooltip_es : label.tooltip_en}>
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', width: '48px', color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                          {(isES ? label.es : label.en).slice(0, 6)}
                        </span>
                        <div style={{ flex: 1, height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                          <div style={{ width: `${val}%`, height: '100%', background: scoreColor(val), borderRadius: '2px', transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.44rem', color: scoreColor(val), width: '22px', textAlign: 'right', flexShrink: 0 }}>{val}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Era + actions row */}
                <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                  <div className="font-cinzel text-[0.65rem] tracking-[0.1em] text-gold/60 uppercase">{getEraName(lang, civ.eraId as EraId, civ.eraName)}</div>
                  <div className="flex items-center gap-2">
                    {/* Enfrentar button (4B) */}
                    <button
                      onClick={e => handleEnfrentar(civ, e)}
                      className={`font-cinzel text-[0.55rem] tracking-wider uppercase px-2 py-1 border transition-all ${
                        isPicked
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-gold/20 text-smoke/70 hover:border-gold/40 hover:text-mist'
                      }`}
                    >
                      {isPicked ? '✓' : '⚔'} {isES ? 'Enfrentar' : 'Battle'}
                    </button>
                    <Link
                      href={`/${lang}/civilizaciones/${civ.slug}`}
                      className="font-cinzel text-[0.65rem] tracking-[0.1em] text-gold/60 uppercase hover:text-gold transition-colors"
                    >
                      {isES ? '→ análisis' : '→ analysis'}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Battle simulation modal (4B) */}
      {battleModal && battlePick.length === 2 && (
        <BattleModal
          civ1={battlePick[0]}
          civ2={battlePick[1]}
          lang={lang}
          onClose={clearBattle}
        />
      )}
    </div>
  )
}
