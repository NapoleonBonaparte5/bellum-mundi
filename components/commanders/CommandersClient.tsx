'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS CLIENT
// Fixed cards + 3D pentagon + tooltip + compare + badges (B1/B5)
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { FlatCommander, Lang, EraId } from '@/lib/data/types'
import { getAllCommanders, ERA_EMOJIS } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { ChipScroller } from '@/components/ui/ChipScroller'
import { getEraName, getRoleName, getCmdName } from '@/lib/i18n'
import { processContent } from '@/lib/utils/processContent'

interface CommandersClientProps {
  lang: Lang
}

// ── Deterministic stats from name hash ────────────────────
function commanderStats(name: string) {
  const h = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    tactics:    ((h * 7)  % 40) + 55,
    logistics:  ((h * 13) % 40) + 50,
    leadership: ((h * 11) % 35) + 60,
    innovation: ((h * 17) % 45) + 45,
    battles:    ((h * 3)  % 30) + 65,
  }
}

type SkillKey = 'tactics' | 'logistics' | 'leadership' | 'innovation' | 'battles'

function topSkill(stats: ReturnType<typeof commanderStats>): SkillKey {
  return (Object.entries(stats) as [SkillKey, number][])
    .sort(([, a], [, b]) => b - a)[0][0]
}

// ── Pentagon radar SVG ────────────────────────────────────
function pentagon5Points(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number]
  })
}

function pts2poly(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function RadarSVG({ stats, size = 100 }: { stats: ReturnType<typeof commanderStats>; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const R = size * 0.42
  const outer = pentagon5Points(cx, cy, R)
  const mid   = pentagon5Points(cx, cy, R * 0.6)
  const inner = pentagon5Points(cx, cy, R * 0.3)

  const keys: SkillKey[] = ['tactics', 'logistics', 'leadership', 'innovation', 'battles']
  const dataPoints: [number, number][] = outer.map(([ox, oy], i) => {
    const val = stats[keys[i]] / 100
    return [cx + (ox - cx) * val, cy + (oy - cy) * val]
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {[outer, mid, inner].map((ring, ri) => (
        <polygon key={ri} points={pts2poly(ring)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      ))}
      {outer.map(([ox, oy], i) => (
        <line key={i} x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      <polygon
        points={pts2poly(dataPoints)}
        fill="rgba(201,168,76,0.25)"
        stroke="rgba(201,168,76,0.7)"
        strokeWidth="1"
      />
      {dataPoints.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="2" fill="var(--gold)" />
      ))}
    </svg>
  )
}

const SKILL_LABELS: Record<SkillKey, { es: string; en: string }> = {
  tactics:    { es: 'Táctica',    en: 'Tactics' },
  logistics:  { es: 'Logística',  en: 'Logistics' },
  leadership: { es: 'Liderazgo',  en: 'Leadership' },
  innovation: { es: 'Innovación', en: 'Innovation' },
  battles:    { es: 'Batallas',   en: 'Battles' },
}

const SKILL_FILTER_OPTIONS = [
  { key: 'all' as const,        labelES: 'Todos',      labelEN: 'All' },
  { key: 'tactics' as SkillKey, labelES: 'Táctica',    labelEN: 'Tactics' },
  { key: 'logistics' as SkillKey, labelES: 'Logística', labelEN: 'Logistics' },
  { key: 'leadership' as SkillKey, labelES: 'Liderazgo', labelEN: 'Leadership' },
  { key: 'innovation' as SkillKey, labelES: 'Innovación', labelEN: 'Innovation' },
  { key: 'battles' as SkillKey, labelES: 'Batallas',   labelEN: 'Battles' },
]

// ── Bloque 5 — Badges automáticos ────────────────────────
function getBadges(stats: ReturnType<typeof commanderStats>): { labelES: string; labelEN: string; color: string }[] {
  const badges = []
  if (stats.tactics    >= 90) badges.push({ labelES: 'Maestro de la Táctica', labelEN: 'Master Tactician',    color: '#C9A84C' })
  if (stats.logistics  >= 85) badges.push({ labelES: 'Gran Logístico',         labelEN: 'Grand Logistician',   color: '#9BB5E0' })
  if (stats.leadership >= 90) badges.push({ labelES: 'Líder Legendario',       labelEN: 'Legendary Leader',    color: '#E8C97A' })
  if (stats.innovation >= 88) badges.push({ labelES: 'Innovador Militar',      labelEN: 'Military Innovator',  color: '#7090D0' })
  if (stats.battles    >= 90) badges.push({ labelES: 'Veterano de Combate',    labelEN: 'Battle Veteran',      color: '#E07070' })
  return badges.slice(0, 2)
}

interface StatTooltip { key: SkillKey; value: number; x: number; y: number }

export function CommandersClient({ lang }: CommandersClientProps) {
  const commanders = useMemo(() => getAllCommanders(), [])
  const eras = useMemo(() => ERAS.map(e => ({ id: e.id, name: e.name })), [])
  const isES = lang === 'es'

  const [query, setQuery]             = useState('')
  const [eraFilter, setEraFilter]     = useState('all')
  const [skillFilter, setSkillFilter] = useState<SkillKey | 'all'>('all')
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [statTooltip, setStatTooltip] = useState<StatTooltip | null>(null)

  // Compare
  const [compareSelected, setCompareSelected] = useState<string[]>([])
  const [compareContent, setCompareContent]   = useState('')
  const [compareLoading, setCompareLoading]   = useState(false)

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
    if (skillFilter !== 'all') {
      res = [...res].sort((a, b) => commanderStats(b.name)[skillFilter] - commanderStats(a.name)[skillFilter])
    }
    return res
  }, [commanders, query, eraFilter, skillFilter])

  const toggleCompare = useCallback((slug: string) => {
    setCompareSelected(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= 2) return [prev[1], slug]
      return [...prev, slug]
    })
    setCompareContent('')
  }, [])

  const runCompareAI = useCallback(async () => {
    if (compareSelected.length !== 2 || compareLoading) return
    const cmd1 = commanders.find(c => c.slug === compareSelected[0])
    const cmd2 = commanders.find(c => c.slug === compareSelected[1])
    if (!cmd1 || !cmd2) return
    setCompareLoading(true)
    setCompareContent('')
    const prompt = isES
      ? `Simula un enfrentamiento histórico hipotético entre ${cmd1.name} y ${cmd2.name}. Analiza sus capacidades tácticas, logísticas y de liderazgo. ¿Quién ganaría y por qué? Sé concreto y riguroso. Máximo 300 palabras.`
      : `Simulate a hypothetical historical confrontation between ${cmd1.name} and ${cmd2.name}. Analyze their tactical, logistical and leadership capabilities. Who would win and why? Be concrete and rigorous. Maximum 300 words.`
    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, lang }),
      })
      if (!res.ok || !res.body) { setCompareLoading(false); return }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
        setCompareContent(processContent(raw))
      }
    } catch { /* silent */ }
    setCompareLoading(false)
  }, [compareSelected, compareLoading, commanders, isES, lang])

  // Pentagon tooltip: detect nearest vertex
  const handlePentagonHover = useCallback((
    e: React.MouseEvent,
    stats: ReturnType<typeof commanderStats>,
    containerEl: HTMLElement | null
  ) => {
    if (!containerEl) return
    const rect = containerEl.getBoundingClientRect()
    const mx = e.clientX - rect.left - rect.width / 2
    const my = e.clientY - rect.top - rect.height / 2
    const STAT_KEYS: SkillKey[] = ['tactics', 'logistics', 'leadership', 'innovation', 'battles']
    const R = 50 * 0.42
    const pts = STAT_KEYS.map((_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5
      return { x: R * Math.cos(angle), y: R * Math.sin(angle) }
    })
    let minDist = Infinity, minIdx = 0
    pts.forEach((p, i) => {
      const d = Math.hypot(p.x - mx, p.y - my)
      if (d < minDist) { minDist = d; minIdx = i }
    })
    if (minDist < 40) {
      const key = STAT_KEYS[minIdx]
      setStatTooltip({ key, value: stats[key], x: e.clientX, y: e.clientY })
    } else {
      setStatTooltip(null)
    }
  }, [])

  const compareCmd1 = commanders.find(c => c.slug === compareSelected[0])
  const compareCmd2 = commanders.find(c => c.slug === compareSelected[1])

  return (
    <div>
      {/* Search row */}
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

      {/* Era chips */}
      <ChipScroller className="mb-4">
        <button onClick={() => setEraFilter('all')} className={`chip ${eraFilter === 'all' ? 'active' : ''}`}>
          {isES ? 'Todas' : 'All'}
        </button>
        {eras.map(era => (
          <button key={era.id} onClick={() => setEraFilter(era.id)} className={`chip ${eraFilter === era.id ? 'active' : ''}`}>
            {ERA_EMOJIS[era.id as EraId]} {getEraName(lang, era.id as EraId, era.name)}
          </button>
        ))}
      </ChipScroller>

      {/* Skill filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SKILL_FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSkillFilter(opt.key)}
            className={`font-cinzel text-[0.55rem] tracking-[0.12em] uppercase px-3 py-1.5 border transition-colors ${
              skillFilter === opt.key
                ? 'border-gold text-gold bg-gold/10'
                : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
            }`}
          >
            {isES ? opt.labelES : opt.labelEN}
          </button>
        ))}
      </div>

      {/* Compare panel */}
      {compareSelected.length === 2 && compareCmd1 && compareCmd2 && (
        <div className="compare-panel mb-6">
          {/* Left commander */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ fontSize: '2rem' }}>{compareCmd1.emoji}</div>
            <div className="font-playfair font-bold text-cream text-base text-center leading-tight">{getCmdName(lang, compareCmd1.name)}</div>
            <RadarSVG stats={commanderStats(compareCmd1.name)} size={90} />
            {(Object.keys(SKILL_LABELS) as SkillKey[]).map(k => {
              const s1 = commanderStats(compareCmd1.name)[k]
              const s2 = commanderStats(compareCmd2.name)[k]
              return (
                <div key={k} className="flex justify-between w-full">
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', letterSpacing: '0.08em', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                    {isES ? SKILL_LABELS[k].es : SKILL_LABELS[k].en}
                  </span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', color: s1 >= s2 ? 'var(--gold)' : 'var(--smoke)', fontWeight: s1 >= s2 ? 700 : 400 }}>
                    {s1}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Center: VS + AI button */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.2rem', color: 'var(--crimson-light)', fontWeight: 900 }}>VS</div>
            {!compareContent && !compareLoading && (
              <button
                onClick={runCompareAI}
                className="btn-primary text-[0.5rem] tracking-[0.15em] px-3 py-2 whitespace-nowrap"
              >
                {isES ? '⚔ Simular IA' : '⚔ AI Simulate'}
              </button>
            )}
            <button
              onClick={() => { setCompareSelected([]); setCompareContent('') }}
              className="font-cinzel text-[0.48rem] tracking-[0.12em] text-smoke hover:text-gold uppercase transition-colors"
            >
              {isES ? '× Limpiar' : '× Clear'}
            </button>
          </div>

          {/* Right commander */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ fontSize: '2rem' }}>{compareCmd2.emoji}</div>
            <div className="font-playfair font-bold text-cream text-base text-center leading-tight">{getCmdName(lang, compareCmd2.name)}</div>
            <RadarSVG stats={commanderStats(compareCmd2.name)} size={90} />
            {(Object.keys(SKILL_LABELS) as SkillKey[]).map(k => {
              const s1 = commanderStats(compareCmd1.name)[k]
              const s2 = commanderStats(compareCmd2.name)[k]
              return (
                <div key={k} className="flex justify-between w-full">
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', letterSpacing: '0.08em', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                    {isES ? SKILL_LABELS[k].es : SKILL_LABELS[k].en}
                  </span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', color: s2 >= s1 ? 'var(--gold)' : 'var(--smoke)', fontWeight: s2 >= s1 ? 700 : 400 }}>
                    {s2}
                  </span>
                </div>
              )
            })}
          </div>

          {/* AI result — spans full width */}
          {(compareLoading || compareContent) && (
            <div className="col-span-3 border-t border-gold/15 pt-4 mt-2">
              {compareLoading && !compareContent && (
                <div className="flex items-center gap-2 text-smoke font-crimson italic text-sm">
                  <div className="loading-dots"><span /><span /><span /></div>
                  {isES ? 'Simulando enfrentamiento...' : 'Simulating confrontation...'}
                </div>
              )}
              {compareContent && (
                <div className="ai-content font-crimson text-parchment-dark text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: compareContent }} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Result counter */}
      <div className="font-cinzel text-[0.72rem] tracking-[0.2em] text-smoke uppercase mb-5">
        <span className="text-gold font-bold text-sm mr-1.5">{filtered.length}</span>
        {isES ? 'comandantes' : 'commanders'}
        {compareSelected.length > 0 && (
          <span className="ml-3 text-gold/60 text-[0.55rem]">
            {isES ? `${compareSelected.length}/2 seleccionados para comparar` : `${compareSelected.length}/2 selected for compare`}
          </span>
        )}
      </div>

      {/* Stat tooltip */}
      {statTooltip && (
        <div
          style={{
            position: 'fixed',
            left: statTooltip.x + 8,
            top: statTooltip.y - 24,
            zIndex: 9999,
            background: 'var(--ink)',
            border: '1px solid rgba(201,168,76,0.4)',
            padding: '0.3rem 0.6rem',
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.52rem',
            letterSpacing: '0.1em',
            color: 'var(--gold)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {isES ? SKILL_LABELS[statTooltip.key].es : SKILL_LABELS[statTooltip.key].en}: {statTooltip.value}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ningún comandante coincide.' : 'No commanders match.'}
        </div>
      ) : (
        <div className="commanders-grid">
          {filtered.map((c) => {
            const stats = commanderStats(c.name)
            const best = topSkill(stats)
            const badges = getBadges(stats)
            const isSelected = compareSelected.includes(c.slug)
            const similars = commanders
              .filter(o => o.eraId === c.eraId && o.slug !== c.slug)
              .slice(0, 3)
            const pentagonRef = { current: null as HTMLDivElement | null }

            return (
              <div
                key={c.slug}
                className="commander-card-fixed"
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredSlug(c.slug)}
                onMouseLeave={() => { setHoveredSlug(null); setStatTooltip(null) }}
              >
                {/* Compare button (⚖) */}
                <button
                  onClick={() => toggleCompare(c.slug)}
                  className={`compare-cmd-btn ${isSelected ? 'selected' : ''}`}
                  title={isES ? (isSelected ? 'Quitar de comparación' : 'Añadir a comparación') : (isSelected ? 'Remove from compare' : 'Add to compare')}
                >
                  ⚖
                </button>

                <Link href={`/${lang}/comandantes/${c.slug}`} className="flex flex-col items-center flex-1 no-underline w-full">
                  {/* Emoji avatar */}
                  <div style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: '0.5rem' }}>{c.emoji}</div>

                  {/* Name */}
                  <div className="font-playfair font-bold text-cream text-lg leading-tight mb-1 line-clamp-2 text-center px-2">
                    {getCmdName(lang, c.name)}
                  </div>

                  {/* Era */}
                  <div className="font-cinzel text-[0.52rem] tracking-[0.1em] text-gold/70 uppercase mb-1 text-center">
                    {getEraName(lang, c.eraId as EraId, c.eraName ?? '')}
                  </div>

                  {/* Role */}
                  <div className="font-crimson italic text-smoke text-xs text-center px-2 mb-2 line-clamp-2">
                    {getRoleName(lang, c.role)}
                  </div>

                  {/* Badges (B5) */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mb-3 px-2">
                      {badges.map(badge => (
                        <span
                          key={badge.labelEN}
                          style={{
                            background: `${badge.color}18`,
                            border: `1px solid ${badge.color}40`,
                            color: badge.color,
                            fontFamily: 'var(--font-cinzel)',
                            fontSize: '0.4rem',
                            letterSpacing: '0.12em',
                            padding: '0.15rem 0.5rem',
                            textTransform: 'uppercase',
                            display: 'inline-block',
                          }}
                        >
                          ★ {isES ? badge.labelES : badge.labelEN}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pentagon with 3D hover + tooltip (B1) */}
                  <div
                    className="pentagon-container"
                    ref={el => { pentagonRef.current = el }}
                    onMouseMove={e => handlePentagonHover(e, stats, pentagonRef.current)}
                    onMouseLeave={() => setStatTooltip(null)}
                  >
                    <div className="pentagon-inner">
                      <RadarSVG stats={stats} size={100} />
                    </div>
                  </div>

                  {/* Skill badge */}
                  <div className="skill-badge mt-1">
                    {isES ? SKILL_LABELS[best].es : SKILL_LABELS[best].en}: {stats[best]}
                  </div>

                  {/* Stat rows */}
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 w-full px-3">
                    {(Object.keys(SKILL_LABELS) as SkillKey[]).map(k => (
                      <div key={k} className="flex justify-between items-center">
                        <span style={{
                          fontFamily: 'var(--font-cinzel)',
                          fontSize: '0.42rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: k === best ? 'var(--gold)' : 'var(--smoke)',
                        }}>
                          {isES ? SKILL_LABELS[k].es : SKILL_LABELS[k].en}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-cinzel)',
                          fontSize: '0.42rem',
                          color: k === best ? 'var(--gold)' : 'rgba(155,149,144,0.7)',
                          fontWeight: k === best ? 700 : 400,
                        }}>
                          {stats[k]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-3 font-cinzel text-[0.55rem] tracking-[0.15em] text-gold/60 uppercase hover:text-gold transition-colors">
                    {isES ? 'Ver perfil →' : 'View profile →'}
                  </div>
                </Link>

                {/* Similar commanders on hover */}
                {hoveredSlug === c.slug && similars.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--steel)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      padding: '0.5rem',
                      zIndex: 20,
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.42rem', letterSpacing: '0.15em', color: 'var(--smoke)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      {isES ? 'De la misma era' : 'From the same era'}
                    </p>
                    <div className="flex gap-2 justify-center">
                      {similars.map(s => (
                        <Link
                          key={s.slug}
                          href={`/${lang}/comandantes/${s.slug}`}
                          title={getCmdName(lang, s.name)}
                          style={{ fontSize: '1.4rem', lineHeight: 1, opacity: 0.85, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                        >
                          {s.emoji}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
