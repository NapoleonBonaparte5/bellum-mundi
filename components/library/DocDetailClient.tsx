'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — DOCUMENT DETAIL CLIENT
// Parallel streaming: analysis + books via Promise.all
// ═══════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { FlatDoc, Era, Lang } from '@/lib/data/types'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'
import { AILoadingState } from '@/components/ui/AILoadingState'

interface DocDetailClientProps {
  doc: FlatDoc
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

const CAT_LABELS: Record<string, { es: string; en: string }> = {
  tratado:   { es: 'Tratado',   en: 'Treaty' },
  obra:      { es: 'Obra',      en: 'Work' },
  documento: { es: 'Documento', en: 'Document' },
  carta:     { es: 'Carta',     en: 'Letter' },
}

export function DocDetailClient({ doc, era, lang }: DocDetailClientProps) {
  const isES = lang === 'es'

  const [aiContent, setAiContent]       = useState<string | null>(null)
  const [booksContent, setBooksContent] = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [booksLoading, setBooksLoading] = useState(false)
  const [queried, setQueried]           = useState(false)
  const [rateLimited, setRateLimited]   = useState(false)
  const [queriesLeft, setQueriesLeft]   = useState(3)

  const relatedDocs = era.docs
    .filter(d => slugify(d.name) !== doc.slug)
    .slice(0, 6)

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)
    setBooksLoading(true)

    const typeLabel = isES
      ? (CAT_LABELS[doc.category]?.es ?? 'documento')
      : (CAT_LABELS[doc.category]?.en ?? 'document')

    const mainPrompt = isES
      ? `Analiza en profundidad el ${typeLabel} histórico "${doc.name}" (${doc.year}). Incluye: contexto histórico de su creación, quiénes lo redactaron y negociaron, contenido principal cláusula por cláusula o idea por idea, consecuencias militares y políticas inmediatas, legado hasta hoy, y por qué sigue siendo relevante. Mínimo 5000 palabras.`
      : `Analyze in depth the historical ${typeLabel} "${doc.name}" (${doc.year}). Include: historical context of its creation, who drafted and negotiated it, main content clause by clause or idea by idea, immediate military and political consequences, legacy to this day, and why it remains relevant. Minimum 5000 words.`

    const booksPrompt = isES
      ? `Eres un librero especialista en historia militar. Lista exactamente 5 libros reales y publicados sobre "${doc.name}" o su contexto histórico (${doc.year}, ${era.name}). Responde ÚNICAMENTE con este HTML, sin texto adicional:\n<div class="book-card">\n  <strong>TÍTULO DEL LIBRO</strong>\n  <span>AUTOR · AÑO</span>\n  <p>Una frase de por qué es esencial.</p>\n  <a href="https://amazon.es/s?k=TITULO+AUTOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`
      : `You are a specialist military history bookseller. List exactly 5 real published books about "${doc.name}" or its historical context (${doc.year}, ${era.name}). Respond ONLY with this HTML, no extra text:\n<div class="book-card">\n  <strong>BOOK TITLE</strong>\n  <span>AUTHOR · YEAR</span>\n  <p>One sentence on why it is essential.</p>\n  <a href="https://amazon.es/s?k=TITLE+AUTHOR&tag=bellummundi-21" target="_blank">Ver en Amazon →</a>\n</div>`

    const HEADERS = { 'Content-Type': 'application/json' }

    try {
      const mainFetch  = fetch('/api/ai-query', { method: 'POST', headers: HEADERS, body: JSON.stringify({ prompt: mainPrompt,  isPremium: false, lang }) })
      const booksFetch = fetch('/api/ai-query', { method: 'POST', headers: HEADERS, body: JSON.stringify({ prompt: booksPrompt, isPremium: false, booksOnly: true, lang }) })

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
  }, [doc, era, isES, loading, queried])

  const eraEmoji = ERA_EMOJIS[era.id]
  const catLabel = isES ? (CAT_LABELS[doc.category]?.es ?? 'Documento') : (CAT_LABELS[doc.category]?.en ?? 'Document')

  return (
    <article className="min-h-screen">
      <header className="bg-gradient-to-b from-crimson/20 to-transparent px-6 py-16 max-w-content mx-auto">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">{isES ? 'Inicio' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${lang}/biblioteca`} className="hover:text-gold transition-colors">{isES ? 'Biblioteca' : 'Library'}</Link>
          <span>/</span>
          <span className="text-mist">{doc.name}</span>
        </nav>

        <div className="text-5xl mb-6">{doc.icon}</div>
        <div className="eyebrow mb-4">{eraEmoji} {era.name} · {doc.year}</div>
        <h1 className="font-playfair font-black text-cream mb-4 leading-tight" style={{ fontSize: 'clamp(1.8rem,5vw,3.5rem)' }}>
          {doc.name}
        </h1>
        <div className={`doc-badge doc-badge-${doc.category} mb-2`}>{catLabel}</div>
      </header>

      <div className="max-w-content mx-auto px-6 pb-16">
        <div className="mb-12">
          {!queried && !loading && !rateLimited && (
            <div className="bg-slate border border-gold/20 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                {isES ? 'Análisis con Inteligencia Artificial' : 'AI-Powered Analysis'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                {isES
                  ? `Genera un análisis histórico completo de este ${catLabel.toLowerCase()} con Claude AI — contexto, contenido, consecuencias y bibliografía.`
                  : `Generate a complete historical analysis of this ${catLabel.toLowerCase()} with Claude AI — context, content, consequences and bibliography.`}
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
              label={isES ? 'Analizando el documento...' : 'Analyzing the document...'}
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

        {/* Related documents from same era */}
        {relatedDocs.length > 0 && (
          <div>
            <div className="eyebrow mb-4">{isES ? 'Documentos de la misma era' : 'Documents from the same era'}</div>
            <div className="index-grid">
              {relatedDocs.map((d, i) => (
                <Link key={i} href={`/${lang}/biblioteca/${slugify(d.name)}`} className="card-bm flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{d.icon}</span>
                  <div>
                    <div className="font-playfair font-bold text-cream text-base leading-tight mb-1">{d.name}</div>
                    <div className="font-cinzel text-[0.5rem] tracking-[0.12em] text-smoke uppercase">{d.year}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
