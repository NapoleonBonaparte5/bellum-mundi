'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS CLIENT (3A + 3B + 3C)
// Military profile cards + radar SVG + skill filter
// + similar commanders on hover
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

// ── Deterministic stats from name hash (3A) ───────────────
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

// ── Pentagon radar SVG (3A) ───────────────────────────────
function pentagon5Points(cx: number, cy: number, r: number, startAngle = -Math.PI / 2): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => {
    const angle = startAngle + (i * 2 * Math.PI) / 5
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number]
  })
}

function pts2poly(pts: [number, number][]): string {
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function RadarSVG({ stats, size = 80 }: { stats: ReturnType<typeof commanderStats>; size?: number }) {
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
      {/* Background rings */}
      {[outer, mid, inner].map((ring, ri) => (
        <polygon key={ri} points={pts2poly(ring)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {outer.map(([ox, oy], i) => (
        <line key={i} x1={cx} y1={cy} x2={ox} y2={oy} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon
        points={pts2poly(dataPoints)}
        fill="rgba(201,168,76,0.25)"
        stroke="rgba(201,168,76,0.7)"
        strokeWidth="1"
      />
      {/* Data points */}
      {dataPoints.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="1.5" fill="var(--gold)" />
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

export function CommandersClient({ lang }: CommandersClientProps) {
  const commanders = useMemo(() => getAllCommanders(), [])
  const eras = useMemo(() => ERAS.map(e => ({ id: e.id, name: e.name })), [])
  const isES = lang === 'es'
  const [query, setQuery] = useState('')
  const [eraFilter, setEraFilter] = useState('all')
  const [skillFilter, setSkillFilter] = useState<SkillKey | 'all'>('all')
  const [hoveredEra, setHoveredEra] = useState<string | null>(null)

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
    // Skill filter (3B): sort by chosen metric descending
    if (skillFilter !== 'all') {
      res = [...res].sort((a, b) => {
        const sa = commanderStats(a.name)[skillFilter]
        const sb = commanderStats(b.name)[skillFilter]
        return sb - sa
      })
    }
    return res
  }, [commanders, query, eraFilter, skillFilter])

  return (
    <div>
      {/* Search + Skill filter row */}
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

        {/* Skill filter dropdown (3B) */}
        <select
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value as SkillKey | 'all')}
          className="bg-slate border border-gold/20 px-3 py-3 text-smoke font-cinzel text-[0.6rem] tracking-[0.1em] uppercase outline-none focus:border-gold/50 cursor-pointer"
        >
          <option value="all">{isES ? 'Ordenar por habilidad' : 'Sort by skill'}</option>
          {(Object.keys(SKILL_LABELS) as SkillKey[]).map(k => (
            <option key={k} value={k}>{isES ? SKILL_LABELS[k].es : SKILL_LABELS[k].en}</option>
          ))}
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
        {isES ? 'comandantes' : 'commanders'}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-smoke font-crimson italic text-lg">
          {isES ? 'Ningún comandante coincide.' : 'No commanders match.'}
        </div>
      ) : (
        <div className="commanders-grid">
          {filtered.map((c) => {
            const stats = commanderStats(c.name)
            const best = topSkill(stats)
            // Similar commanders: same era, excluding self (3C)
            const similars = commanders
              .filter(o => o.eraId === c.eraId && o.slug !== c.slug)
              .slice(0, 3)

            return (
              <div
                key={c.slug}
                className="card-bm commander-card"
                style={{ position: 'relative' }}
                onMouseEnter={() => setHoveredEra(c.slug)}
                onMouseLeave={() => setHoveredEra(null)}
              >
                <Link href={`/${lang}/comandantes/${c.slug}`} className="flex flex-col items-center flex-1 no-underline">
                  {/* Large emoji */}
                  <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '0.6rem' }}>{c.emoji}</div>

                  {/* Name */}
                  <div className="font-playfair font-bold text-cream text-lg leading-tight mb-1 line-clamp-2 text-center px-2">
                    {getCmdName(lang, c.name)}
                  </div>

                  {/* Era badge */}
                  <div className="font-cinzel text-[0.58rem] tracking-[0.1em] text-gold/70 uppercase mb-1 text-center">
                    {getEraName(lang, c.eraId as EraId, c.eraName ?? '')}
                  </div>

                  {/* Role */}
                  <div className="font-crimson italic text-smoke text-xs text-center px-2 mb-3 line-clamp-2">
                    {getRoleName(lang, c.role)}
                  </div>

                  {/* Radar SVG (3A) */}
                  <RadarSVG stats={stats} size={80} />

                  {/* Stat labels */}
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
                    {isES ? 'Ver perfil completo →' : 'View full profile →'}
                  </div>
                </Link>

                {/* Similar commanders on hover (3C) */}
                {hoveredEra === c.slug && similars.length > 0 && (
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
