'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDER DETAIL CLIENT
// Parallel streaming: analysis + books via Promise.all
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { FlatCommander, Era, Lang } from '@/lib/data/types'
import { supabase } from '@/lib/supabase/client'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'
import { AILoadingState } from '@/components/ui/AILoadingState'
import { getRoleName, getEraName } from '@/lib/i18n'

interface CommanderDetailClientProps {
  commander: FlatCommander
  era: Era
  lang: Lang
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

export function CommanderDetailClient({ commander, era, lang }: CommanderDetailClientProps) {
  const isES = lang === 'es'
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token ?? null)
    })
  }, [])

  const [aiContent, setAiContent]       = useState<string | null>(null)
  const [booksContent, setBooksContent] = useState<string | null>(null)
  const [topicContent, setTopicContent] = useState<string | null>(null)
  const [topicLabel, setTopicLabel]     = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [booksLoading, setBooksLoading] = useState(false)
  const [topicLoading, setTopicLoading] = useState(false)
  const [queried, setQueried]           = useState(false)
  const [rateLimited, setRateLimited]   = useState(false)
  const [queriesLeft, setQueriesLeft]   = useState(3)

  const relatedBattles = era.battles_data.slice(0, 6)

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)
    setBooksLoading(true)

    const mainPrompt = isES
      ? `Analiza en detalle la vida militar de ${commander.name}, ${commander.role} de la era ${era.name}.`
      : `Analyze in detail the military life of ${commander.name}, ${commander.role} of the ${era.name} era.`

    const booksPrompt = isES
      ? `Eres un librero especialista en historia militar. Lista exactamente 5 libros reales y publicados sobre ${commander.name} o su contexto militar. Responde ÚNICAMENTE con este HTML, sin texto adicional:\n<div class="book-card">\n  <strong>TÍTULO DEL LIBRO</strong>\n  <span>AUTOR · AÑO</span>\n  <p>Una frase de por qué es esencial.</p>\n  <a href="https://amazon.es/s?k=TITULO+AUTOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`
      : `You are a specialist military history bookseller. List exactly 5 real published books about ${commander.name} or their military context. Respond ONLY with this HTML, no extra text:\n<div class="book-card">\n  <strong>BOOK TITLE</strong>\n  <span>AUTHOR · YEAR</span>\n  <p>One sentence on why it is essential.</p>\n  <a href="https://amazon.es/s?k=TITLE+AUTHOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`

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
      setAiContent(`<p>${isES ? 'Error al obtener el análisis.' : 'Error fetching analysis.'}</p>`)
      setLoading(false)
      setBooksLoading(false)
    }
  }, [commander, era, isES, loading, queried])

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
      if (res.status === 429) setRateLimited(true)
      else if (res.ok && res.body) await readStream(res.body, setTopicContent)
    } catch {
      setTopicContent(`<p>${isES ? 'Error al obtener el análisis.' : 'Error fetching analysis.'}</p>`)
    }
    setTopicLoading(false)
    setQueriesLeft(q => Math.max(0, q - 1))
  }, [era, isES, topicLoading, rateLimited])

  const eraEmoji = ERA_EMOJIS[era.id]

  return (
    <article className="min-h-screen">
      <header className="bg-gradient-to-b from-crimson/20 to-transparent px-6 py-16 max-w-content mx-auto">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">{isES ? 'Inicio' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${lang}/comandantes`} className="hover:text-gold transition-colors">{isES ? 'Comandantes' : 'Commanders'}</Link>
          <span>/</span>
          <span className="text-mist">{commander.name}</span>
        </nav>
        <div className="text-6xl mb-6">{commander.emoji}</div>
        <div className="eyebrow mb-4">{eraEmoji} {getEraName(lang, era.id, era.name)}</div>
        <h1 className="font-playfair font-black text-cream mb-3 leading-tight" style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
          {commander.name}
        </h1>
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase">{getRoleName(lang, commander.role)}</p>
      </header>

      <div className="max-w-content mx-auto px-6 pb-16">
        <div className="mb-12">
          {!queried && !loading && !rateLimited && (
            <div className="bg-slate border border-gold/20 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                {isES ? 'Análisis con IA' : 'AI Analysis'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                {isES ? `Genera el perfil militar completo de ${commander.name} con Claude AI.` : `Generate the full military profile of ${commander.name} with Claude AI.`}
              </p>
              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke mb-6">
                {isES ? `${queriesLeft} consultas gratuitas disponibles hoy` : `${queriesLeft} free queries available today`}
              </div>
              <button onClick={runQuery} className="btn-primary">{isES ? '⚡ Analizar con IA' : '⚡ Analyze with AI'}</button>
            </div>
          )}

          {loading && !aiContent && (
            <AILoadingState
              lang={lang}
              label={isES ? 'Analizando el comandante...' : 'Analyzing the commander...'}
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
                ✦ {isES ? 'Análisis generado con Claude AI' : 'Analysis generated with Claude AI'}
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

        {/* Tactics */}
        {era.tactics.length > 0 && (
          <div className="mb-10">
            <div className="eyebrow mb-4">{isES ? 'Tácticas de la era' : 'Era Tactics'}</div>
            <div className="era-cards-grid">
              {era.tactics.map((tactic, i) => (
                <button key={i} onClick={() => runTopicQuery(tactic.name, isES ? 'táctica' : 'tactic')}
                  className="card-bm era-topic-card text-left w-full" disabled={topicLoading || rateLimited}>
                  <span className="text-2xl mb-2 block">{tactic.icon}</span>
                  <div className="font-playfair font-bold text-cream text-base leading-tight">{tactic.name}</div>
                  <div className="font-crimson text-smoke text-sm mt-1">{tactic.origin}</div>
                  <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-gold/60 uppercase mt-3">
                    {isES ? '⚡ Consultar con IA' : '⚡ Query with AI'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weapons */}
        {era.weapons.length > 0 && (
          <div className="mb-10">
            <div className="eyebrow mb-4">{isES ? 'Armamento del período' : 'Period Weaponry'}</div>
            <div className="era-cards-grid">
              {era.weapons.map((weapon, i) => (
                <button key={i} onClick={() => runTopicQuery(weapon.name, isES ? 'arma' : 'weapon')}
                  className="card-bm era-topic-card text-left w-full" disabled={topicLoading || rateLimited}>
                  <span className="text-2xl mb-2 block">{weapon.icon}</span>
                  <div className="font-playfair font-bold text-cream text-base leading-tight">{weapon.name}</div>
                  <div className="font-crimson text-smoke text-sm mt-1">{weapon.period}</div>
                  <div className="font-cinzel text-[0.45rem] tracking-[0.1em] text-gold/60 uppercase mt-3">
                    {isES ? '⚡ Consultar con IA' : '⚡ Query with AI'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic result */}
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
