'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDER DETAIL CLIENT
// Profile + AI analysis + related battles
// ═══════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { FlatCommander, Era, Lang } from '@/lib/data/types'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'

interface CommanderDetailClientProps {
  commander: FlatCommander
  era: Era
  lang: Lang
}

export function CommanderDetailClient({ commander, era, lang }: CommanderDetailClientProps) {
  const isES = lang === 'es'
  const [aiContent, setAiContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [queried, setQueried] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)

    const prompt = isES
      ? `Analiza en detalle la vida militar de ${commander.name}, ${commander.role} de la era ${era.name}.`
      : `Analyze in detail the military life of ${commander.name}, ${commander.role} of the ${era.name} era.`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isPremium: false }),
      })
      if (res.status === 429) { setRateLimited(true); setLoading(false); return }
      const data = await res.json()
      if (data.content) { setAiContent(data.content); setQueried(true) }
    } catch {
      setAiContent(`<p>${isES ? 'Error al obtener el análisis.' : 'Error fetching analysis.'}</p>`)
    }
    setLoading(false)
  }, [commander, era, isES, loading, queried])

  const eraEmoji = ERA_EMOJIS[era.id]

  const relatedBattles = era.battles_data.slice(0, 6)

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
        <div className="eyebrow mb-4">{eraEmoji} {era.name}</div>
        <h1 className="font-playfair font-black text-cream mb-3 leading-tight"
          style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}>
          {commander.name}
        </h1>
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase">{commander.role}</p>
      </header>

      <div className="max-w-content mx-auto px-6 pb-16">
        {/* AI analysis */}
        <div className="mb-12">
          {!queried && !loading && !rateLimited && (
            <div className="bg-slate border border-gold/20 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                {isES ? 'Análisis con IA' : 'AI Analysis'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                {isES
                  ? `Genera el perfil militar completo de ${commander.name} con Claude AI.`
                  : `Generate the full military profile of ${commander.name} with Claude AI.`
                }
              </p>
              <button onClick={runQuery} className="btn-primary">
                {isES ? '⚡ Analizar con IA' : '⚡ Analyze with AI'}
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate border border-gold/20 p-12 flex flex-col items-center gap-4">
              <div className="loading-dots"><span /><span /><span /></div>
              <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke uppercase">
                {isES ? 'Analizando el comandante...' : 'Analyzing the commander...'}
              </p>
            </div>
          )}

          {rateLimited && (
            <div className="bg-slate border border-crimson/40 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-crimson-light uppercase mb-3">
                {isES ? 'Límite diario alcanzado' : 'Daily limit reached'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6">
                {isES ? 'Actualiza a Premium para consultas ilimitadas.' : 'Upgrade to Premium for unlimited queries.'}
              </p>
              <Link href={`/${lang}#pricing`} className="btn-primary inline-block">
                {isES ? '⚡ Ver Premium' : '⚡ View Premium'}
              </Link>
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
        </div>

        {/* Related battles */}
        {relatedBattles.length > 0 && (
          <div>
            <div className="eyebrow mb-4">
              {isES ? 'Batallas de la era' : 'Battles of the era'}
            </div>
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
