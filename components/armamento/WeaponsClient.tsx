'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WEAPONS DATABASE CLIENT
// Search · Era filter · AI analysis · 400+ weapons
// ═══════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import type { FlatWeapon, Lang, EraId } from '@/lib/data/types'
import { ERA_COLORS, ERA_EMOJIS } from '@/lib/data/helpers'
import { getEraName, translateYear } from '@/lib/i18n'
import { processContent } from '@/lib/utils/processContent'
import { AILoadingState } from '@/components/ui/AILoadingState'

interface WeaponsClientProps {
  weapons: FlatWeapon[]
  lang: Lang
}

// ── Category icons → label map ───────────────────────────────
const ICON_CATEGORY: Record<string, { es: string; en: string }> = {
  '🗡️': { es: 'Arma Blanca',    en: 'Bladed Weapon' },
  '⚔️': { es: 'Espada',         en: 'Sword' },
  '🏹': { es: 'Arma a Distancia', en: 'Ranged Weapon' },
  '🪓': { es: 'Hacha',          en: 'Axe' },
  '🛡️': { es: 'Defensa',        en: 'Defense' },
  '🔪': { es: 'Cuchillo/Daga',  en: 'Knife/Dagger' },
  '🎯': { es: 'Proyectil',      en: 'Projectile' },
  '⛵': { es: 'Naval',          en: 'Naval' },
  '🛞': { es: 'Vehículo',       en: 'Vehicle' },
  '🏰': { es: 'Asedio',         en: 'Siege' },
  '💣': { es: 'Explosivo',      en: 'Explosive' },
  '🔫': { es: 'Arma de Fuego',  en: 'Firearm' },
  '💥': { es: 'Explosivo',      en: 'Explosive' },
  '🚀': { es: 'Misil/Cohete',   en: 'Missile/Rocket' },
  '✈️': { es: 'Aéreo',          en: 'Aircraft' },
  '🦾': { es: 'Blindado',       en: 'Armored' },
  '☠️': { es: 'Arma Química',   en: 'Chemical Weapon' },
  '💨': { es: 'Arma Química',   en: 'Chemical Weapon' },
  '☢️': { es: 'Arma Nuclear',   en: 'Nuclear Weapon' },
  '🌊': { es: 'Naval',          en: 'Naval' },
  '🪵': { es: 'Arma Primitiva', en: 'Primitive Weapon' },
  '⚪': { es: 'Proyectil',      en: 'Projectile' },
  '💪': { es: 'Contundente',    en: 'Bludgeon' },
}

function getCategory(icon: string, lang: Lang): string {
  const cat = ICON_CATEGORY[icon]
  if (!cat) return lang === 'en' ? 'Weapon' : 'Arma'
  return lang === 'en' ? cat.en : cat.es
}

// ── Era ordering ─────────────────────────────────────────────
const ERA_ORDER: EraId[] = [
  'prehistoric', 'ancient', 'classical', 'medieval',
  'early_modern', 'napoleon', 'ww1', 'ww2', 'cold_war', 'contemporary',
]

const ERA_NAMES_ES: Record<EraId, string> = {
  prehistoric: 'Prehistoria',
  ancient: 'Antigüedad',
  classical: 'Clásica',
  medieval: 'Medieval',
  early_modern: 'Edad Moderna',
  napoleon: 'Napoleónica',
  ww1: 'Primera GM',
  ww2: 'Segunda GM',
  cold_war: 'Guerra Fría',
  contemporary: 'Contemporánea',
}
const ERA_NAMES_EN: Record<EraId, string> = {
  prehistoric: 'Prehistoric',
  ancient: 'Ancient',
  classical: 'Classical',
  medieval: 'Medieval',
  early_modern: 'Early Modern',
  napoleon: 'Napoleonic',
  ww1: 'World War I',
  ww2: 'World War II',
  cold_war: 'Cold War',
  contemporary: 'Contemporary',
}

// ══════════════════════════════════════════════════════════════
export function WeaponsClient({ weapons, lang }: WeaponsClientProps) {
  const isES = lang === 'es'

  const [search, setSearch]         = useState('')
  const [activeEra, setActiveEra]   = useState<EraId | 'all'>('all')
  const [selected, setSelected]     = useState<FlatWeapon | null>(null)
  const [aiContent, setAiContent]   = useState<string | null>(null)
  const [aiLoading, setAiLoading]   = useState(false)

  // ── Filter ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return weapons.filter(w => {
      const matchEra  = activeEra === 'all' || w.eraId === activeEra
      const matchText = !q ||
        w.name.toLowerCase().includes(q) ||
        w.period.toLowerCase().includes(q) ||
        w.eraName.toLowerCase().includes(q)
      return matchEra && matchText
    })
  }, [weapons, search, activeEra])

  // Count per era (for badges)
  const eraCounts = useMemo(() => {
    const counts: Partial<Record<EraId, number>> = {}
    for (const w of weapons) {
      counts[w.eraId] = (counts[w.eraId] ?? 0) + 1
    }
    return counts
  }, [weapons])

  // ── AI analysis ─────────────────────────────────────────
  const analyzeWeapon = useCallback(async (weapon: FlatWeapon) => {
    if (aiLoading) return
    setSelected(weapon)
    setAiContent(null)
    setAiLoading(true)

    const prompt = isES
      ? `Eres un historiador militar especializado en historia de la tecnología bélica. Explica en detalle el arma militar "${weapon.name}" del período ${weapon.period} (era: ${weapon.eraName}).\n\nIncluye: origen e inventores, materiales y construcción, cómo se usaba en combate, ventajas y limitaciones, batallas clave donde fue decisiva, evolución posterior e impacto en la historia militar. Mínimo 400 palabras.`
      : `You are a military historian specializing in the history of weapons technology. Explain in detail the military weapon "${weapon.name}" from the period ${weapon.period} (era: ${weapon.eraName}).\n\nInclude: origin and inventors, materials and construction, how it was used in combat, advantages and limitations, key battles where it was decisive, subsequent evolution and impact on military history. Minimum 400 words.`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isPremium: false, lang }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setAiContent(processContent(acc))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      setAiContent(`<p>[Error: ${msg}]</p>`)
    }
    setAiLoading(false)
  }, [isES, lang, aiLoading])

  const eraLabel = (id: EraId) =>
    isES ? ERA_NAMES_ES[id] : ERA_NAMES_EN[id]

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <div className="border-b border-gold/20 bg-slate/50 px-6 py-8">
        <div className="max-w-content mx-auto">
          <p className="eyebrow mb-2">{isES ? 'Arsenal Histórico' : 'Historical Arsenal'}</p>
          <h1 className="font-cinzel text-gold text-3xl font-bold mb-2">
            {isES ? '🗡️ Base de Datos de Armamento' : '🗡️ Weapons Database'}
          </h1>
          <p className="text-smoke text-base">
            {isES
              ? `${weapons.length} armas militares históricas · Del Paleolítico al siglo XXI · Haz clic en cualquier arma para el análisis con IA`
              : `${weapons.length} historical military weapons · From the Paleolithic to the 21st century · Click any weapon for AI analysis`}
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isES
              ? 'Buscar arma por nombre, período, era...'
              : 'Search weapon by name, period, era...'}
            className="w-full max-w-lg bg-slate border border-gold/25 text-mist placeholder-smoke/50 text-sm px-4 py-3 focus:outline-none focus:border-gold/60 transition-colors font-crimson"
          />
        </div>

        {/* Era filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveEra('all')}
            className={`font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-3 py-1.5 border transition-all ${
              activeEra === 'all'
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
            }`}
          >
            {isES ? 'Todas' : 'All'} ({weapons.length})
          </button>
          {ERA_ORDER.map(id => {
            const count = eraCounts[id] ?? 0
            if (!count) return null
            return (
              <button
                key={id}
                onClick={() => setActiveEra(activeEra === id ? 'all' : id)}
                className={`font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-3 py-1.5 border transition-all ${
                  activeEra === id
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
                }`}
                style={activeEra === id ? { borderColor: ERA_COLORS[id], color: ERA_COLORS[id] } : {}}
              >
                {ERA_EMOJIS[id]} {eraLabel(id)} ({count})
              </button>
            )
          })}
        </div>

        {/* Result count */}
        <div className="font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke uppercase mb-5">
          {filtered.length === weapons.length
            ? (isES ? `${weapons.length} armas en el archivo` : `${weapons.length} weapons in the archive`)
            : (isES ? `${filtered.length} armas encontradas` : `${filtered.length} weapons found`)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── Weapons grid ── */}
          <div>
            {ERA_ORDER.map(eraId => {
              const eraWeapons = filtered.filter(w => w.eraId === eraId)
              if (!eraWeapons.length) return null
              return (
                <div key={eraId} className="mb-8">
                  {/* Era heading */}
                  <div
                    className="flex items-center gap-2 mb-3 pb-2 border-b"
                    style={{ borderColor: ERA_COLORS[eraId] + '40' }}
                  >
                    <span className="text-base">{ERA_EMOJIS[eraId]}</span>
                    <span
                      className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold"
                      style={{ color: ERA_COLORS[eraId] }}
                    >
                      {eraLabel(eraId)}
                    </span>
                    <span className="font-cinzel text-[0.5rem] tracking-wider text-smoke ml-1">
                      ({eraWeapons.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eraWeapons.map((w, i) => (
                      <button
                        key={i}
                        onClick={() => analyzeWeapon(w)}
                        className={`text-left p-3 border transition-all group ${
                          selected?.slug === w.slug
                            ? 'border-gold bg-gold/10'
                            : 'border-gold/15 bg-slate/20 hover:border-gold/35 hover:bg-slate/45'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0 mt-0.5">{w.icon}</span>
                          <div className="min-w-0">
                            <div className="font-cinzel text-[0.62rem] tracking-wider text-mist group-hover:text-gold transition-colors leading-snug mb-1 line-clamp-2">
                              {w.name}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-cinzel text-[0.48rem] tracking-[0.1em] text-smoke uppercase">
                                {w.period}
                              </span>
                              <span
                                className="font-cinzel text-[0.44rem] tracking-[0.1em] px-1 py-0.5 uppercase"
                                style={{ color: ERA_COLORS[w.eraId], border: `1px solid ${ERA_COLORS[w.eraId]}40` }}
                              >
                                {getCategory(w.icon, lang)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-smoke font-crimson italic">
                {isES ? `No se encontraron armas para "${search}"` : `No weapons found for "${search}"`}
              </div>
            )}
          </div>

          {/* ── AI Analysis panel (sticky) ── */}
          <div className="sticky top-20">
            {!selected && (
              <div className="border border-gold/20 bg-slate/30 p-8 text-center">
                <div className="text-4xl mb-4">🗡️</div>
                <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-gold uppercase mb-2">
                  {isES ? 'Análisis con IA' : 'AI Analysis'}
                </p>
                <p className="font-crimson italic text-smoke text-sm">
                  {isES
                    ? 'Haz clic en cualquier arma para generar un análisis histórico detallado con Claude AI'
                    : 'Click any weapon to generate a detailed historical analysis with Claude AI'}
                </p>
              </div>
            )}

            {selected && (
              <div className="border border-gold/20 bg-slate">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-gold/15 flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{selected.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-cinzel text-[0.5rem] tracking-[0.15em] uppercase mb-1"
                      style={{ color: ERA_COLORS[selected.eraId] }}
                    >
                      {eraLabel(selected.eraId)} · {getCategory(selected.icon, lang)}
                    </div>
                    <h2 className="font-cinzel text-gold text-sm font-bold leading-snug">
                      {selected.name}
                    </h2>
                    <div className="font-cinzel text-[0.5rem] tracking-wider text-smoke uppercase mt-1">
                      {selected.period}
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setAiContent(null) }}
                    className="text-smoke hover:text-gold transition-colors font-cinzel text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[65vh] overflow-y-auto">
                  {aiLoading && !aiContent && (
                    <AILoadingState lang={lang} label={isES ? 'Analizando el armamento...' : 'Analyzing the weapon...'} />
                  )}
                  {aiContent && (
                    <div
                      className="ai-content font-crimson text-parchment-dark text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: aiContent }}
                    />
                  )}
                </div>

                {/* Footer actions */}
                {!aiLoading && aiContent && (
                  <div className="border-t border-gold/10 px-5 py-3 flex items-center justify-between">
                    <span className="font-cinzel text-[0.45rem] tracking-wider text-smoke uppercase">
                      {isES ? '✦ Generado con Claude AI' : '✦ Generated with Claude AI'}
                    </span>
                    <button
                      onClick={() => analyzeWeapon(selected)}
                      className="font-cinzel text-[0.5rem] tracking-widest uppercase text-gold hover:text-gold-light transition-colors"
                    >
                      {isES ? '↺ Regenerar' : '↺ Regenerate'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
