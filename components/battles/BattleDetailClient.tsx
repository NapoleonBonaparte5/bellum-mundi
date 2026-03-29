'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLE DETAIL CLIENT
// Parallel streaming: analysis + books via Promise.all
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { FlatBattle, Era, Lang } from '@/lib/data/types'
import { supabase } from '@/lib/supabase/client'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'
import { getTagName, translateCombatants, translateYear, getBattleName, getEraName, autoTranslateDesc } from '@/lib/i18n'
import { AILoadingState } from '@/components/ui/AILoadingState'
import { processContent } from '@/lib/utils/processContent'
import { t } from '@/lib/i18n'

// const BattleVisualization = dynamic(...)  — disponible próximamente

const LS_KEY = 'bm_queries_used'
const PREMIUM_THRESHOLD = 3 // show banner after this many queries

interface BattleDetailClientProps {
  battle: FlatBattle
  era: Era
  lang: Lang
}

interface WikiImage {
  url: string
  title: string
}

// ── Stream a response body into a state setter ──────────────
async function readStream(
  body: ReadableStream<Uint8Array>,
  setter: (v: string) => void,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let acc = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    acc += decoder.decode(value, { stream: true })
    setter(processContent(acc))
  }
}

// ── Counterfactual preset generator ─────────────────────────
interface Counterfactual {
  label: string
  question: string
  impact: 'high' | 'medium' | 'low' | 'alto' | 'medio' | 'bajo'
}

function getCounterfactuals(battle: FlatBattle, isES: boolean): Counterfactual[] {
  const side1 = battle.combatants.split(' vs ')[0]?.trim() ?? battle.combatants
  return isES
    ? [
        {
          label: 'Refuerzos decisivos',
          question: `¿Qué habría pasado si ${side1} hubiera recibido refuerzos masivos justo antes de la batalla de ${battle.name}?`,
          impact: 'alto',
        },
        {
          label: 'Cambio de liderazgo',
          question: `¿Y si el comandante principal hubiera muerto o caído prisionero antes del inicio de la batalla de ${battle.name}?`,
          impact: 'alto',
        },
        {
          label: 'Factor climático o logístico',
          question: `¿Cómo habría cambiado el resultado de ${battle.name} si las condiciones climáticas o logísticas hubieran sido radicalmente distintas?`,
          impact: 'medio',
        },
      ]
    : [
        {
          label: 'Decisive Reinforcements',
          question: `What would have happened if ${side1} had received massive reinforcements just before the Battle of ${battle.name}?`,
          impact: 'high',
        },
        {
          label: 'Change of Leadership',
          question: `What if the main commander had died or been captured before the start of the Battle of ${battle.name}?`,
          impact: 'high',
        },
        {
          label: 'Weather or Logistics',
          question: `How would the outcome of the Battle of ${battle.name} have changed if the weather or logistical conditions had been radically different?`,
          impact: 'medium',
        },
      ]
}

// ── Extract image search terms from prompt ──────────────────
function extractImageTerms(prompt: string): string[] {
  const terms: string[] = []
  const m1 = prompt.match(/batalla de ([^(,\n]+)/i)
  if (m1) terms.push(m1[1].trim() + ' battle historical')
  const m2 = prompt.match(/vida militar de ([^,\n]+)/i)
  if (m2) terms.push(m2[1].trim() + ' portrait historical')
  return terms.slice(0, 2)
}

export function BattleDetailClient({ battle, era, lang }: BattleDetailClientProps) {
  const isES = lang === 'es'

  const [aiContent, setAiContent]     = useState<string | null>(null)
  const [booksContent, setBooksContent] = useState<string | null>(null)
  const [topicContent, setTopicContent] = useState<string | null>(null)
  const [topicLabel, setTopicLabel]   = useState<string | null>(null)
  const [images, setImages]           = useState<WikiImage[]>([])
  const [loading, setLoading]         = useState(false)
  const [booksLoading, setBooksLoading] = useState(false)
  const [topicLoading, setTopicLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [queried, setQueried]         = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [queriesLeft, setQueriesLeft] = useState(3)
  const [showPremiumBanner, setShowPremiumBanner] = useState(false)

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen]                 = useState(true)

  // Session token for AI auth
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token ?? null)
    })
  }, [])

  // Counterfactual simulator + 3D tab
  const [activeTab, setActiveTab]                     = useState<'analysis' | 'counterfactual' | 'viz3d'>('analysis')
  const [cfContent, setCfContent]                     = useState<string | null>(null)
  const [cfLoading, setCfLoading]                     = useState(false)
  const [cfQuestion, setCfQuestion]                   = useState('')
  const [cfCustomInput, setCfCustomInput]             = useState('')
  const [cfSelectedPreset, setCfSelectedPreset]       = useState<number | null>(null)
  const counterfactuals = getCounterfactuals(battle, isES)

  useEffect(() => {
    const used = parseInt(localStorage.getItem(LS_KEY) ?? '0', 10)
    if (used >= PREMIUM_THRESHOLD) setShowPremiumBanner(true)
  }, [])

  const related = era.battles_data
    .filter(b => slugify(b.name) !== battle.slug)
    .slice(0, 6)

  const fetchImages = useCallback(async (terms: string[]) => {
    if (!terms.length) return
    setImageLoading(true)
    try {
      const res = await fetch(`/api/get-images?terms=${encodeURIComponent(terms.join('|'))}`)
      if (res.ok) setImages((await res.json()).images ?? [])
    } catch { /* silent */ }
    setImageLoading(false)
  }, [])

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)
    setBooksLoading(true)

    const mainPrompt = isES
      ? `Analiza en detalle la batalla de ${battle.name} (${battle.year}). Combatientes: ${battle.combatants}. ${battle.desc}`
      : `Analyze in detail the Battle of ${battle.name} (${battle.year}). Combatants: ${battle.combatants}. ${battle.desc}`

    const booksPrompt = isES
      ? `Eres un librero especialista en historia militar. Lista exactamente 5 libros reales y publicados sobre ${battle.name} (${battle.year}). Responde ÚNICAMENTE con este HTML, sin texto adicional:\n<div class="book-card">\n  <strong>TÍTULO DEL LIBRO</strong>\n  <span>AUTOR · AÑO</span>\n  <p>Una frase de por qué es esencial.</p>\n  <a href="https://amazon.es/s?k=TITULO+AUTOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`
      : `You are a specialist military history bookseller. List exactly 5 real published books about ${battle.name} (${battle.year}). Respond ONLY with this HTML, no extra text:\n<div class="book-card">\n  <strong>BOOK TITLE</strong>\n  <span>AUTHOR · YEAR</span>\n  <p>One sentence on why it is essential.</p>\n  <a href="https://amazon.es/s?k=TITLE+AUTHOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`

    const HEADERS: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}),
    }

    try {
      // Fire both fetches simultaneously
      const mainFetch  = fetch('/api/ai-query', { method: 'POST', headers: HEADERS, body: JSON.stringify({ prompt: mainPrompt,  lang }) })
      const booksFetch = fetch('/api/ai-query', { method: 'POST', headers: HEADERS, body: JSON.stringify({ prompt: booksPrompt, booksOnly: true, lang }) })

      const [mainRes, booksRes] = await Promise.all([mainFetch, booksFetch])

      if (mainRes.status === 429) {
        setRateLimited(true)
        setLoading(false)
        setBooksLoading(false)
        return
      }

      setQueried(true)
      setQueriesLeft(q => Math.max(0, q - 1))
      // Track usage in localStorage for premium upsell
      const used = parseInt(localStorage.getItem(LS_KEY) ?? '0', 10) + 1
      localStorage.setItem(LS_KEY, String(used))
      if (used >= PREMIUM_THRESHOLD) setShowPremiumBanner(true)

      // Stream both bodies concurrently
      await Promise.all([
        mainRes.body
          ? readStream(mainRes.body, setAiContent).then(() => {
              setLoading(false)
              fetchImages(extractImageTerms(mainPrompt))
            })
          : Promise.resolve(),
        (booksRes.ok && booksRes.body)
          ? readStream(booksRes.body, setBooksContent).finally(() => setBooksLoading(false))
          : Promise.resolve().then(() => setBooksLoading(false)),
      ])
    } catch {
      setAiContent(`<p>${isES ? 'Error al obtener el análisis. Inténtalo de nuevo.' : 'Error fetching analysis. Please try again.'}</p>`)
      setLoading(false)
      setBooksLoading(false)
    }
  }, [battle, isES, loading, queried, fetchImages])

  const runTopicQuery = useCallback(async (name: string, type: 'táctica' | 'arma' | 'tactic' | 'weapon') => {
    if (topicLoading || rateLimited) return
    setTopicLoading(true)
    setTopicLabel(name)
    setTopicContent(null)

    const prompt = isES
      ? `Explica en detalle la ${type === 'táctica' ? 'táctica militar' : 'arma histórica'} "${name}" de la era ${era.name}. Proporciona contexto histórico, uso en batalla, evolución y legado militar.`
      : `Explain in detail the ${type === 'tactic' ? 'military tactic' : 'historical weapon'} "${name}" from the ${era.name} era. Provide historical context, use in battle, evolution and military legacy.`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ prompt, lang }),
      })
      if (res.status === 429) { setRateLimited(true) }
      else if (res.ok && res.body) await readStream(res.body, setTopicContent)
    } catch {
      setTopicContent(`<p>${isES ? 'Error al obtener el análisis.' : 'Error fetching analysis.'}</p>`)
    }
    setTopicLoading(false)
    setQueriesLeft(q => Math.max(0, q - 1))
  }, [era, isES, topicLoading, rateLimited])

  const runCounterfactual = useCallback(async (question: string) => {
    if (!question.trim() || cfLoading) return
    setCfContent(null)
    setCfLoading(true)
    setCfQuestion(question)

    const prompt = isES
      ? `Eres un historiador militar experto en análisis contrafactuales. Analiza el siguiente escenario hipotético sobre la batalla de ${battle.name} (${battle.year}), entre ${battle.combatants}.\n\nEscenario: ${question}\n\nRespóndelo en profundidad (400-600 palabras): qué habría pasado inmediatamente, cómo se habrían desarrollado los eventos a corto plazo, y cuál habría sido el impacto a largo plazo en la historia. Incluye una estimación de probabilidad de resultado alternativo (muy probable / probable / poco probable / casi imposible) con tu justificación.`
      : `You are a military historian specializing in counterfactual analysis. Analyze the following hypothetical scenario about the Battle of ${battle.name} (${battle.year}), between ${battle.combatants}.\n\nScenario: ${question}\n\nAnswer in depth (400-600 words): what would have happened immediately, how events would have unfolded in the short term, and what the long-term historical impact would have been. Include a probability estimate for the alternative outcome (very likely / likely / unlikely / almost impossible) with your justification.`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ prompt, lang }),
      })
      if (res.status === 429) {
        setRateLimited(true)
      } else if (res.ok && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          setCfContent(processContent(acc))
        }
      }
    } catch {
      setCfContent(`<p>${isES ? 'Error al generar el análisis contrafactual.' : 'Error generating counterfactual analysis.'}</p>`)
    }
    setCfLoading(false)
  }, [battle, isES, lang, cfLoading])

  const eraEmoji = ERA_EMOJIS[era.id]

  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-b from-crimson/20 to-transparent px-6 py-16 max-w-content mx-auto detail-header-enter">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">{isES ? 'Inicio' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${lang}/batallas`} className="hover:text-gold transition-colors">{isES ? 'Batallas' : 'Battles'}</Link>
          <span>/</span>
          <span className="text-mist">{getBattleName(lang, battle.name)}</span>
        </nav>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left: title + meta */}
          <div style={{ flex: '1 1 55%', minWidth: 0 }}>
            <div className="eyebrow mb-4 detail-meta-enter">{eraEmoji} {getEraName(lang, era.id, era.name)} · {translateYear(lang, battle.year)}</div>
            <h1 className="font-playfair font-black text-cream mb-4 leading-tight detail-title-enter" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
              {getBattleName(lang, battle.name)}
            </h1>
            <p className="font-crimson italic text-parchment-dark text-xl mb-4 detail-combatants-enter">{translateCombatants(lang, battle.combatants)}</p>
            {battle.desc && <p className="font-crimson text-smoke text-lg max-w-2xl">{autoTranslateDesc(battle.desc, lang)}</p>}
            {battle.tag && <div className="era-badge mt-4">{getTagName(lang, battle.tag)}</div>}
          </div>
          {/* Right: 2×2 quick-stats panel */}
          <div className="battle-stats-quick" style={{
            flex: '0 0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2px',
            background: 'rgba(201,168,76,0.08)',
            marginTop: '2.5rem',
            minWidth: '260px',
          }}>
            {[
              { label: isES ? 'Año' : 'Year',         value: translateYear(lang, battle.year) },
              { label: isES ? 'Era' : 'Era',           value: getEraName(lang, era.id, era.name) },
              { label: isES ? 'Combatientes' : 'Combatants', value: translateCombatants(lang, battle.combatants) },
              { label: isES ? 'Tipo' : 'Type',         value: battle.tag ? getTagName(lang, battle.tag) : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--slate)', padding: '0.85rem 1.1rem' }}>
                <div className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase text-smoke/60 mb-1">{label}</div>
                <div className="font-crimson text-sm text-cream leading-snug">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-content mx-auto px-6 pb-16 detail-grid">

        {/* ── MAIN COLUMN ── */}
        <div>

          {/* Tab bar */}
          <div className="battle-tabs-row flex border-b border-gold/20 mb-8 gap-0">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`font-cinzel text-[0.6rem] tracking-[0.2em] uppercase px-5 py-3 transition-all border-b-2 -mb-px ${
                activeTab === 'analysis'
                  ? 'text-gold border-gold'
                  : 'text-smoke border-transparent hover:text-mist hover:border-gold/30'
              }`}
            >
              {t(lang, 'detail.analysisTab')}
            </button>
            <button
              onClick={() => setActiveTab('counterfactual')}
              className={`font-cinzel text-[0.6rem] tracking-[0.2em] uppercase px-5 py-3 transition-all border-b-2 -mb-px ${
                activeTab === 'counterfactual'
                  ? 'text-gold border-gold'
                  : 'text-smoke border-transparent hover:text-mist hover:border-gold/30'
              }`}
            >
              🔀 {t(lang, 'detail.simulatorTab')}
            </button>
            {/* Tab Vista 3D — Próximamente */}
            <button
              disabled
              className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase px-5 py-3 transition-all border-b-2 -mb-px text-smoke/40 border-transparent cursor-not-allowed relative"
              title={t(lang, 'detail.comingSoon')}
            >
              {t(lang, 'detail.view3dTab')}
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'var(--crimson)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.38rem',
                letterSpacing: '0.1em',
                padding: '0.1rem 0.3rem',
                textTransform: 'uppercase',
                borderRadius: '1px',
              }}>
                {isES ? 'Pronto' : 'Soon'}
              </span>
            </button>
          </div>

          {/* ── COUNTERFACTUAL SIMULATOR TAB ── */}
          {activeTab === 'counterfactual' && (
            <div className="mb-12">
              <div className="mb-6">
                <p className="eyebrow mb-2">{isES ? 'Historia Alternativa' : 'Alternative History'}</p>
                <h2 className="font-playfair font-bold text-cream text-xl mb-2">
                  {isES ? '¿Y si el resultado hubiera sido diferente?' : 'What if the outcome had been different?'}
                </h2>
                <p className="font-crimson text-smoke text-base">
                  {isES
                    ? 'Elige uno de los escenarios predefinidos o escribe tu propia variable para simular un resultado alternativo.'
                    : 'Choose a predefined scenario or write your own variable to simulate an alternative outcome.'}
                </p>
              </div>

              {/* Preset scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {counterfactuals.map((cf, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCfSelectedPreset(i)
                      setCfCustomInput('')
                      runCounterfactual(cf.question)
                    }}
                    disabled={cfLoading}
                    className={`text-left p-4 border transition-all group disabled:opacity-40 disabled:cursor-not-allowed ${
                      cfSelectedPreset === i && cfQuestion === cf.question
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/25 bg-slate/30 hover:border-gold/50 hover:bg-slate/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-cinzel text-[0.55rem] tracking-[0.15em] text-gold uppercase">
                        {cf.label}
                      </span>
                      <span className={`font-cinzel text-[0.5rem] tracking-[0.1em] uppercase px-1.5 py-0.5 flex-shrink-0 ${
                        cf.impact === 'alto' || cf.impact === 'high'
                          ? 'text-crimson bg-crimson/10 border border-crimson/30'
                          : 'text-smoke bg-steel/30 border border-gold/20'
                      }`}>
                        {cf.impact}
                      </span>
                    </div>
                    <p className="font-crimson text-smoke text-sm group-hover:text-mist transition-colors leading-snug">
                      {cf.question}
                    </p>
                  </button>
                ))}
              </div>

              {/* Custom variable */}
              <div className="mb-6">
                <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke uppercase mb-2">
                  {isES ? 'Variable personalizada' : 'Custom Variable'}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={cfCustomInput}
                    onChange={e => { setCfCustomInput(e.target.value); setCfSelectedPreset(null) }}
                    placeholder={isES
                      ? '¿Y si... escribe tu propio escenario hipotético'
                      : 'What if... write your own hypothetical scenario'}
                    className="flex-1 bg-ink border border-gold/25 text-mist placeholder-smoke/40 text-sm px-4 py-3 focus:outline-none focus:border-gold/60 transition-colors font-crimson"
                    onKeyDown={e => { if (e.key === 'Enter' && cfCustomInput.trim()) runCounterfactual(cfCustomInput) }}
                    disabled={cfLoading}
                  />
                  <button
                    onClick={() => runCounterfactual(cfCustomInput)}
                    disabled={!cfCustomInput.trim() || cfLoading}
                    className="btn-primary px-5 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isES ? 'Simular' : 'Simulate'}
                  </button>
                </div>
              </div>

              {/* Result */}
              {cfLoading && !cfContent && (
                <AILoadingState lang={lang} label={isES ? 'Calculando historia alternativa...' : 'Computing alternative history...'} />
              )}

              {cfContent && (
                <div className="bg-slate border border-gold/20 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gold/10">
                    <span className="text-xl">🔀</span>
                    <div>
                      <div className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke uppercase mb-0.5">
                        {isES ? 'Escenario analizado' : 'Analyzed scenario'}
                      </div>
                      <p className="font-crimson italic text-mist text-sm leading-snug">{cfQuestion}</p>
                    </div>
                  </div>
                  <div
                    className="ai-content font-crimson text-parchment-dark text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: cfContent }}
                  />
                  <div className="mt-6 pt-4 border-t border-gold/10 flex gap-3 flex-wrap">
                    <button
                      onClick={() => { setCfContent(null); setCfQuestion(''); setCfSelectedPreset(null); setCfCustomInput('') }}
                      className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-smoke hover:text-gold transition-colors border border-gold/20 px-4 py-2"
                    >
                      {isES ? '↩ Nuevo escenario' : '↩ New scenario'}
                    </button>
                  </div>
                </div>
              )}

              {rateLimited && (
                <div className="bg-slate border border-crimson/40 p-6 text-center">
                  <p className="font-cinzel text-[0.6rem] tracking-widest text-crimson-light uppercase mb-2">
                    {isES ? 'Límite diario alcanzado' : 'Daily limit reached'}
                  </p>
                  <Link href={`/${lang}#pricing`} className="btn-primary inline-block mt-3">
                    {isES ? '⚡ Ver Premium' : '⚡ View Premium'}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── 3D VISUALIZATION TAB — Próximamente ── */}
          {activeTab === 'viz3d' && (
            <div className="py-20 text-center">
              <div style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.65rem',
                letterSpacing: '0.4em',
                color: 'var(--gold)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                opacity: 0.7,
              }}>
                {t(lang, 'detail.comingSoon')}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                color: 'var(--cream)',
                marginBottom: '1rem',
              }}>
                {t(lang, 'detail.viz3dTitle')}
              </h3>
              <p style={{
                fontFamily: 'var(--font-crimson)',
                fontStyle: 'italic',
                fontSize: '1.05rem',
                color: 'var(--mist)',
                maxWidth: '480px',
                margin: '0 auto 2rem',
                lineHeight: 1.7,
              }}>
                {t(lang, 'detail.viz3dDesc')}
              </p>
              <div style={{
                display: 'inline-block',
                border: '1px solid rgba(201,168,76,0.3)',
                padding: '0.75rem 2rem',
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                color: 'rgba(201,168,76,0.5)',
                textTransform: 'uppercase',
              }}>
                {t(lang, 'detail.viz3dBadge')}
              </div>
            </div>
          )}

          {/* ── ANALYSIS TAB (existing content) ── */}
          {activeTab === 'analysis' && (<>

          {/* Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video bg-steel overflow-hidden">
                  <Image src={img.url} alt={img.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
                  <div className="absolute bottom-0 left-0 right-0 bg-ink/70 px-2 py-1">
                    <p className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke truncate">{img.title}</p>
                  </div>
                </div>
              ))}
              {imageLoading && (
                <div className="aspect-video bg-slate flex items-center justify-center">
                  <div className="loading-dots"><span /><span /><span /></div>
                </div>
              )}
            </div>
          )}

          {/* AI section */}
          <div className="mb-12">
            {!queried && !loading && !rateLimited && (
              <div className="bg-slate border border-gold/20 p-8 text-center">
                <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                  {isES ? 'Análisis con Inteligencia Artificial' : 'AI-Powered Analysis'}
                </div>
                <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                  {isES
                    ? `Genera un análisis histórico completo de la ${battle.name} con Claude AI — contexto, tácticas, consecuencias y bibliografía.`
                    : `Generate a complete historical analysis of ${battle.name} with Claude AI — context, tactics, consequences and bibliography.`}
                </p>
                <div className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke mb-6">
                  {isES ? `${queriesLeft} consultas gratuitas disponibles hoy` : `${queriesLeft} free queries available today`}
                </div>
                <button onClick={runQuery} className="btn-primary">
                  {isES ? '⚡ Analizar con IA' : '⚡ Analyze with AI'}
                </button>
              </div>
            )}

            {loading && !aiContent && (
              <AILoadingState
                lang={lang}
                label={isES ? 'Analizando la batalla...' : 'Analyzing the battle...'}
              />
            )}

            {rateLimited && (
              <div className="bg-slate border border-crimson/40 p-8 text-center">
                <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-crimson-light uppercase mb-3">
                  {isES ? 'Límite diario alcanzado' : 'Daily limit reached'}
                </div>
                <p className="font-crimson italic text-smoke text-lg mb-6">
                  {isES ? 'Has utilizado tus 3 consultas gratuitas de hoy. Actualiza a Premium para consultas ilimitadas.' : 'You have used your 3 free queries for today. Upgrade to Premium for unlimited queries.'}
                </p>
                <Link href={`/${lang}#pricing`} className="btn-primary inline-block">
                  {isES ? '⚡ Ver Premium' : '⚡ View Premium'}
                </Link>
              </div>
            )}

            {aiContent && (
              <div className="bg-slate border border-gold/10 p-8 md:p-12">
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-6 pb-4 border-b border-gold/10">
                  {isES ? '✦ Análisis generado con Claude AI' : '✦ Analysis generated with Claude AI'}
                </div>
                <div className="ai-content font-crimson text-parchment-dark text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: aiContent }} />
                {/* Share button */}
                <div className="mt-8 pt-6 border-t border-gold/10 flex items-center gap-4 flex-wrap">
                  <span className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">
                    {isES ? 'Compartir análisis' : 'Share analysis'}
                  </span>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      isES
                        ? `Acabo de leer el análisis de la ${battle.name} en @BellumMundi — historia militar como nunca la habías visto 🗡️`
                        : `Just read the analysis of ${getBattleName('en', battle.name)} on @BellumMundi — military history like you've never seen it 🗡️`
                    )}&url=${encodeURIComponent(`https://bellummundi.com/${lang}/batallas/${battle.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase border border-gold/30 text-gold px-4 py-2 hover:border-gold/60 hover:bg-gold/5 transition-colors"
                  >
                    𝕏 {isES ? 'Compartir en X' : 'Share on X'}
                  </a>
                </div>
              </div>
            )}

            {/* Books — parallel phase */}
            {(booksLoading || booksContent) && (
              <div className="mt-4 bg-slate border border-gold/10 p-8 md:p-12">
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-6 pb-4 border-b border-gold/10">
                  {isES ? '📚 Libros Recomendados' : '📚 Recommended Books'}
                </div>
                {booksLoading && !booksContent && (
                  <div className="flex items-center gap-3 text-smoke">
                    <div className="loading-dots"><span /><span /><span /></div>
                    <span className="font-crimson italic">{isES ? 'Seleccionando libros esenciales...' : 'Selecting essential books...'}</span>
                  </div>
                )}
                {booksContent && <div className="ai-content" dangerouslySetInnerHTML={{ __html: booksContent }} />}
              </div>
            )}
          </div>

          {/* Topic query result */}
          {(topicLoading || topicContent) && (
            <div className="mb-10 bg-slate border border-gold/20 p-8 md:p-12">
              {topicLabel && (
                <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-gold uppercase mb-6 pb-4 border-b border-gold/10">
                  ⚡ {topicLabel}
                </div>
              )}
              {topicLoading && !topicContent && (
                <AILoadingState lang={lang} />
              )}
              {topicContent && (
                <div className="ai-content font-crimson text-parchment-dark text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: topicContent }} />
              )}
            </div>
          )}

          {/* Premium upsell banner */}
          {showPremiumBanner && (
            <div className="mb-10 border border-gold/40 bg-gold/5 p-8 text-center">
              <div className="font-cinzel text-[0.55rem] tracking-[0.3em] text-gold uppercase mb-3">
                ⚔ {isES ? 'Desbloquea el Conocimiento Completo' : 'Unlock Complete Knowledge'}
              </div>
              <h3 className="font-playfair font-bold text-cream text-2xl mb-3">
                {isES ? 'Has leído 3 análisis — actualiza a Premium' : 'You\'ve read 3 analyses — upgrade to Premium'}
              </h3>
              <p className="font-crimson italic text-smoke text-lg max-w-lg mx-auto mb-6">
                {isES
                  ? 'Con Premium obtienes análisis ilimitados, acceso a los 8.000+ registros y sin límite de consultas de IA.'
                  : 'With Premium you get unlimited analyses, access to 8,000+ records and unlimited AI queries.'
                }
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href={`/${lang}#pricing`} className="btn-primary">
                  {isES ? '⚡ Ver planes Premium' : '⚡ View Premium plans'}
                </Link>
                <button
                  onClick={() => setShowPremiumBanner(false)}
                  className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke hover:text-gold uppercase"
                >
                  {isES ? 'Ahora no' : 'Not now'}
                </button>
              </div>
            </div>
          )}
          </>) /* end activeTab === 'analysis' */}
        </div>

        {/* ── SIDEBAR TOGGLE ── */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="font-cinzel text-[0.5rem] tracking-[0.18em] uppercase"
          style={{
            position: 'sticky',
            top: '5rem',
            alignSelf: 'start',
            justifySelf: 'end',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(10,8,6,0.85)',
            border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--gold)',
            padding: '0.35rem 0.7rem',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'border-color 0.2s',
            gridColumn: '2',
          }}
          title={sidebarOpen ? (isES ? 'Ocultar panel' : 'Hide panel') : (isES ? 'Mostrar panel' : 'Show panel')}
        >
          {sidebarOpen ? '⊟' : '⊞'} {sidebarOpen ? (isES ? 'Ocultar' : 'Hide') : (isES ? 'Panel' : 'Panel')}
        </button>

        {/* ── SIDEBAR ── */}
        <aside className="detail-sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>

          {/* Reading time (after AI loads) */}
          {aiContent && (
            <div className="sidebar-card mb-4">
              <div className="sidebar-card-title">
                {isES ? '⏱ Tiempo de lectura' : '⏱ Reading time'}
              </div>
              <div className="font-cinzel text-2xl text-gold font-black">
                {Math.max(1, Math.round(aiContent.replace(/<[^>]+>/g, '').split(/\s+/).length / 238))} min
              </div>
            </div>
          )}

          {/* Map link if coordinates available */}
          {(battle.lat !== undefined && battle.lng !== undefined) && (
            <div className="sidebar-card mb-4">
              <div className="sidebar-card-title">
                {isES ? '📍 Ubicación' : '📍 Location'}
              </div>
              <Link
                href={`/${lang}/mapa`}
                className="font-cinzel text-[0.55rem] tracking-[0.15em] text-gold hover:text-gold-light uppercase transition-colors block"
              >
                {battle.lat.toFixed(2)}°, {battle.lng.toFixed(2)}° →
              </Link>
            </div>
          )}

          {/* Era tactics */}
          {era.tactics.length > 0 && (
            <div className="sidebar-card mb-4">
              <div className="sidebar-card-title">
                {isES ? 'Tácticas de la era' : 'Era Tactics'}
              </div>
              <div className="flex flex-col gap-2">
                {era.tactics.map((tactic, i) => (
                  <button key={i} onClick={() => runTopicQuery(tactic.name, isES ? 'táctica' : 'tactic')}
                    className="text-left flex items-center gap-2 hover:text-gold transition-colors group" disabled={topicLoading || rateLimited}>
                    <span className="text-lg flex-shrink-0">{tactic.icon}</span>
                    <div>
                      <div className="font-crimson text-cream text-sm group-hover:text-gold transition-colors">{tactic.name}</div>
                      <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke uppercase">{tactic.origin}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Era weapons */}
          {era.weapons.length > 0 && (
            <div className="sidebar-card mb-4">
              <div className="sidebar-card-title">
                {isES ? 'Armamento del período' : 'Period Weaponry'}
              </div>
              <div className="flex flex-col gap-2">
                {era.weapons.slice(0, 6).map((weapon, i) => (
                  <button key={i} onClick={() => runTopicQuery(weapon.name, isES ? 'arma' : 'weapon')}
                    className="text-left flex items-center gap-2 hover:text-gold transition-colors group" disabled={topicLoading || rateLimited}>
                    <span className="text-lg flex-shrink-0">{weapon.icon}</span>
                    <div>
                      <div className="font-crimson text-cream text-sm group-hover:text-gold transition-colors">{weapon.name}</div>
                      <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke uppercase">{weapon.period}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related battles */}
          {related.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card-title">
                {isES ? 'Batallas de la misma era' : 'Battles from the same era'}
              </div>
              <div className="flex flex-col gap-3">
                {related.map((b, i) => (
                  <Link key={i} href={`/${lang}/batallas/${slugify(b.name)}`} className="group">
                    <div className="font-cinzel text-[0.45rem] tracking-[0.12em] text-smoke uppercase mb-0.5">{b.year}</div>
                    <div className="font-crimson text-cream text-sm group-hover:text-gold transition-colors leading-tight">{getBattleName(lang, b.name)}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  )
}
