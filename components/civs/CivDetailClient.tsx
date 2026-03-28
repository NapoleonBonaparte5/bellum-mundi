'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATION DETAIL CLIENT
// Metrics panel + parallel streaming AI analysis + books
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { FlatCivilization, Era, Lang } from '@/lib/data/types'
import { supabase } from '@/lib/supabase/client'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'
import { AILoadingState } from '@/components/ui/AILoadingState'

interface CivDetailClientProps {
  civ: FlatCivilization
  era: Era
  lang: Lang
}

const METRIC_META: Record<string, { es: string; en: string; weight: number; tooltip_es: string; tooltip_en: string }> = {
  territory:  { es: 'Territorio',  en: 'Territory',  weight: 0.15, tooltip_es: 'Extensión máxima en km² normalizada',               tooltip_en: 'Maximum extent in km² normalized' },
  duration:   { es: 'Duración',    en: 'Duration',   weight: 0.15, tooltip_es: 'Años de dominio militar activo',                    tooltip_en: 'Years of active military dominance' },
  victories:  { es: 'Victorias',   en: 'Victories',  weight: 0.25, tooltip_es: '% conflictos documentados ganados',                 tooltip_en: 'Percentage of documented conflicts won' },
  innovation: { es: 'Innovación',  en: 'Innovation', weight: 0.15, tooltip_es: 'Innovaciones militares documentadas',               tooltip_en: 'Documented military innovations' },
  projection: { es: 'Proyección',  en: 'Projection', weight: 0.15, tooltip_es: 'Capacidad de operar fuera de su región base',       tooltip_en: 'Ability to project force beyond home region' },
  economy:    { es: 'Economía',    en: 'Economy',    weight: 0.10, tooltip_es: 'Capacidad económica para sostener ejércitos',       tooltip_en: 'Economic capacity to sustain armies' },
  legacy:     { es: 'Legado',      en: 'Legacy',     weight: 0.05, tooltip_es: 'Influencia en doctrinas militares posteriores',     tooltip_en: 'Influence on subsequent military doctrines' },
}

function scoreColor(score: number): string {
  if (score >= 90) return '#F9F5ED'
  if (score >= 75) return '#C9A84C'
  if (score >= 60) return '#E87C3A'
  return '#C0392B'
}

function processContent(raw: string): string {
  let html = raw
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  html = html.replace(/^#{1,2}\s+(.+)$/gm, '\n<h2>$1</h2>\n')
  html = html.replace(/^#{3}\s+(.+)$/gm, '\n<h3>$1</h3>\n')
  html = html.replace(/\*\*([^*\n]{3,60})\*\*\s*\n/g, '\n<h3>$1</h3>\n')
  html = html.replace(/\*\*([^*\n]{3,60})\*\*\s+([A-ZÁÉÍÓÚÑÜ])/g, '</p>\n<h3>$1</h3>\n<p>$2')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  const blocks = html.split(/\n{2,}/)
  html = blocks.map(block => {
    block = block.trim()
    if (!block) return ''
    if (block.startsWith('<h') || block.startsWith('<table') ||
        block.startsWith('<figure') || block.startsWith('<div') ||
        block.startsWith('<ul') || block.startsWith('<ol')) return block
    return `<p>${block.replace(/\n/g, ' ')}</p>`
  }).filter(Boolean).join('\n')
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>(<h[23]>)/g, '$1')
  html = html.replace(/(<\/h[23]>)<\/p>/g, '$1')
  html = html.replace(/<p>(?=\d)/g, '<p class="num-data">')
  return html
}

async function readStream(body: ReadableStream<Uint8Array>, setter: (v: string) => void): Promise<void> {
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

export function CivDetailClient({ civ, era, lang }: CivDetailClientProps) {
  const isES = lang === 'es'
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token ?? null)
    })
  }, [])

  const [aiContent, setAiContent]       = useState<string | null>(null)
  const [booksContent, setBooksContent] = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [booksLoading, setBooksLoading] = useState(false)
  const [queried, setQueried]           = useState(false)
  const [rateLimited, setRateLimited]   = useState(false)
  const [queriesLeft, setQueriesLeft]   = useState(3)

  const relatedBattles = era.battles_data.slice(0, 6)
  const score = civ.powerScore
  const color = scoreColor(score)
  const eraEmoji = ERA_EMOJIS[era.id]

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)
    setBooksLoading(true)

    const mainPrompt = isES
      ? `Analiza el poder militar de ${civ.name} durante su período ${civ.period}. Incluye: organización militar, armas y tácticas propias, principales victorias y derrotas, generales más importantes, innovaciones militares, comparación con contemporáneos, y por qué ascendió y cayó. Mínimo 5000 palabras.`
      : `Analyze the military power of ${civ.name} during its period ${civ.period}. Include: military organization, weapons and tactics, major victories and defeats, most important generals, military innovations, comparison with contemporaries, and why it rose and fell. Minimum 5000 words.`

    const booksPrompt = isES
      ? `Eres un librero especialista en historia militar. Lista exactamente 5 libros reales y publicados sobre ${civ.name} o su poderío militar. Responde ÚNICAMENTE con este HTML, sin texto adicional:\n<div class="book-card">\n  <strong>TÍTULO DEL LIBRO</strong>\n  <span>AUTOR · AÑO</span>\n  <p>Una frase de por qué es esencial.</p>\n  <a href="https://amazon.es/s?k=TITULO+AUTOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`
      : `You are a specialist military history bookseller. List exactly 5 real published books about ${civ.name} or its military power. Respond ONLY with this HTML, no extra text:\n<div class="book-card">\n  <strong>BOOK TITLE</strong>\n  <span>AUTHOR · YEAR</span>\n  <p>One sentence on why it is essential.</p>\n  <a href="https://amazon.es/s?k=TITLE+AUTHOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`

    const HEADERS: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}),
    }

    try {
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

      await Promise.all([
        mainRes.body
          ? readStream(mainRes.body, setAiContent).then(() => setLoading(false))
          : Promise.resolve(),
        (booksRes.ok && booksRes.body)
          ? readStream(booksRes.body, setBooksContent).then(() => setBooksLoading(false))
          : Promise.resolve(),
      ])
    } catch {
      setAiContent(`<p>${isES ? 'Error al obtener el análisis. Inténtalo de nuevo.' : 'Error fetching analysis. Please try again.'}</p>`)
      setLoading(false)
      setBooksLoading(false)
    }
  }, [civ, era, isES, loading, queried])

  return (
    <article className="min-h-screen">
      <header className="bg-gradient-to-b from-crimson/20 to-transparent px-6 py-16 max-w-content mx-auto">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">{isES ? 'Inicio' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${lang}/civilizaciones`} className="hover:text-gold transition-colors">{isES ? 'Civilizaciones' : 'Civilizations'}</Link>
          <span>/</span>
          <span className="text-mist">{civ.name}</span>
        </nav>

        <div className="text-6xl mb-6">{civ.flag}</div>
        <div className="eyebrow mb-4">{eraEmoji} {era.name}</div>
        <h1 className="font-playfair font-black text-cream mb-3 leading-tight" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
          {civ.name}
        </h1>
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase">{civ.period}</p>
      </header>

      <div className="max-w-content mx-auto px-6 pb-16">

        {/* Metrics panel */}
        <div className="bg-slate border border-gold/20 p-6 mb-10">
          <div className="eyebrow mb-5">{isES ? 'Poder Militar' : 'Military Power'}</div>

          {/* Score header + formula */}
          <div className="flex items-start gap-6 mb-6">
            <div>
              <div className="font-cinzel font-bold" style={{ fontSize: '3.5rem', lineHeight: 1, color }}>{Math.round(score)}</div>
              <div className="font-cinzel text-[0.4rem] tracking-[0.15em] text-smoke uppercase mt-1">
                {isES ? 'Score total' : 'Total score'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-cinzel text-[0.42rem] tracking-[0.08em] text-smoke/70 leading-relaxed break-words">
                (territory×0.15) + (duration×0.15) + (victories×0.25) + (innovation×0.15) + (projection×0.15) + (economy×0.10) + (legacy×0.05)
              </div>
              {/* Main power bar */}
              <div className="h-2 bg-ash rounded-full overflow-hidden mt-3">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, background: 'linear-gradient(to right, var(--crimson), var(--gold-light))' }} />
              </div>
            </div>
          </div>

          {/* 7 metric bars */}
          <div className="space-y-3">
            {Object.entries(civ.metrics).map(([key, val]) => {
              const meta = METRIC_META[key]
              if (!meta) return null
              const barColor = val >= 80 ? 'var(--gold)' : val >= 60 ? '#E87C3A' : 'var(--crimson)'
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-cinzel text-[0.46rem] tracking-[0.1em] uppercase"
                        style={{ color: val >= 75 ? '#C9A84C' : val >= 50 ? '#9B9590' : '#6B6560' }}
                        title={isES ? meta.tooltip_es : meta.tooltip_en}
                      >
                        {isES ? meta.es : meta.en}
                      </span>
                      <span className="font-cinzel text-[0.38rem] text-smoke/40 uppercase">×{meta.weight}</span>
                      <span className="font-cinzel text-[0.38rem] text-smoke/40 cursor-help"
                        title={isES ? meta.tooltip_es : meta.tooltip_en}>ⓘ</span>
                    </div>
                    <span className="font-cinzel text-[0.46rem] font-bold" style={{ color: val >= 75 ? '#C9A84C' : '#9B9590' }}>
                      {val}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-ash rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: barColor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI section */}
        <div className="mb-12">
          {!queried && !loading && !rateLimited && (
            <div className="bg-slate border border-gold/20 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                {isES ? 'Análisis Militar con IA' : 'AI Military Analysis'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                {isES
                  ? `Genera un análisis militar completo de ${civ.name} con Claude AI — organización, tácticas, victorias y legado.`
                  : `Generate a complete military analysis of ${civ.name} with Claude AI — organization, tactics, victories and legacy.`}
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
              label={isES ? 'Analizando la civilización...' : 'Analyzing the civilization...'}
            />
          )}

          {rateLimited && (
            <div className="bg-slate border border-crimson/40 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-crimson-light uppercase mb-3">
                {isES ? 'Límite diario alcanzado' : 'Daily limit reached'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6">
                {isES ? 'Actualiza a Premium para consultas ilimitadas.' : 'Upgrade to Premium for unlimited queries.'}
              </p>
              <Link href={`/${lang}#pricing`} className="btn-primary inline-block">{isES ? '⚡ Ver Premium' : '⚡ View Premium'}</Link>
            </div>
          )}

          {aiContent && (
            <div className="bg-slate border border-gold/10 p-8 md:p-12">
              <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase mb-6 pb-4 border-b border-gold/10">
                {isES ? '✦ Análisis generado con Claude AI' : '✦ Analysis generated with Claude AI'}
              </div>
              <div className="ai-content font-crimson text-parchment-dark text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: aiContent }} />
            </div>
          )}

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

        {/* Related battles */}
        {relatedBattles.length > 0 && (
          <div>
            <div className="eyebrow mb-4">{isES ? 'Batallas de la era' : 'Battles of the era'}</div>
            <div className="battles-grid">
              {relatedBattles.map((b, i) => (
                <Link key={i} href={`/${lang}/batallas/${slugify(b.name)}`} className="card-bm block">
                  <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mb-1">{b.year}</div>
                  <div className="font-playfair font-bold text-cream text-base leading-tight">{b.name}</div>
                  <div className="font-crimson text-smoke text-sm mt-1">{b.combatants}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
