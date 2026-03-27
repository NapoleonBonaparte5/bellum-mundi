'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLE DETAIL CLIENT
// AI analysis + Wikipedia images + related battles
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { FlatBattle, Era, Lang } from '@/lib/data/types'
import { ERA_EMOJIS, slugify } from '@/lib/data/helpers'

interface BattleDetailClientProps {
  battle: FlatBattle
  era: Era
  lang: Lang
}

interface WikiImage {
  url: string
  title: string
}

export function BattleDetailClient({ battle, era, lang }: BattleDetailClientProps) {
  const isES = lang === 'es'
  const [aiContent, setAiContent] = useState<string | null>(null)
  const [images, setImages] = useState<WikiImage[]>([])
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [queried, setQueried] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [queriesLeft, setQueriesLeft] = useState(3)

  // Related battles from same era
  const related = era.battles_data
    .filter(b => slugify(b.name) !== battle.slug)
    .slice(0, 6)

  const fetchImages = useCallback(async (terms: string[]) => {
    if (!terms.length) return
    setImageLoading(true)
    try {
      const res = await fetch(`/api/get-images?terms=${encodeURIComponent(terms.join('|'))}`)
      if (res.ok) {
        const data = await res.json()
        setImages(data.images ?? [])
      }
    } catch { /* silent */ }
    setImageLoading(false)
  }, [])

  const runQuery = useCallback(async () => {
    if (loading || queried) return
    setLoading(true)

    const prompt = isES
      ? `Analiza en detalle la batalla de ${battle.name} (${battle.year}). Combatientes: ${battle.combatants}. ${battle.desc}`
      : `Analyze in detail the Battle of ${battle.name} (${battle.year}). Combatants: ${battle.combatants}. ${battle.desc}`

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isPremium: false }),
      })

      if (res.status === 429) {
        setRateLimited(true)
        setLoading(false)
        return
      }

      const data = await res.json()
      if (data.content) {
        setAiContent(data.content)
        setQueried(true)
        setQueriesLeft(q => Math.max(0, q - 1))
        if (data.imageTerms?.length) {
          fetchImages(data.imageTerms)
        }
      }
    } catch {
      setAiContent(`<p>${isES ? 'Error al obtener el análisis. Inténtalo de nuevo.' : 'Error fetching analysis. Please try again.'}</p>`)
    }
    setLoading(false)
  }, [battle, isES, loading, queried, fetchImages])

  const eraEmoji = ERA_EMOJIS[era.id]

  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-b from-crimson/20 to-transparent px-6 py-16 max-w-content mx-auto">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">
            {isES ? 'Inicio' : 'Home'}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/batallas`} className="hover:text-gold transition-colors">
            {isES ? 'Batallas' : 'Battles'}
          </Link>
          <span>/</span>
          <span className="text-mist">{battle.name}</span>
        </nav>

        <div className="eyebrow mb-4">
          {eraEmoji} {era.name} · {battle.year}
        </div>
        <h1 className="font-playfair font-black text-cream mb-4 leading-tight"
          style={{ fontSize: 'clamp(2rem,6vw,4rem)' }}
        >
          {battle.name}
        </h1>
        <p className="font-crimson italic text-parchment-dark text-xl mb-4">{battle.combatants}</p>
        {battle.desc && (
          <p className="font-crimson text-smoke text-lg max-w-2xl">{battle.desc}</p>
        )}
        {battle.tag && (
          <div className="era-badge mt-4">{battle.tag}</div>
        )}
      </header>

      <div className="max-w-content mx-auto px-6 pb-16">

        {/* Images (after AI query) */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-8">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-video bg-steel overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-ink/70 px-2 py-1">
                  <p className="font-cinzel text-[0.45rem] tracking-[0.1em] text-smoke truncate">{img.title}</p>
                </div>
              </div>
            ))}
            {imageLoading && (
              <div className="aspect-video bg-slate flex items-center justify-center">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI analysis */}
        <div className="mb-12">
          {!queried && !loading && !rateLimited && (
            <div className="bg-slate border border-gold/20 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-3">
                {isES ? 'Análisis con Inteligencia Artificial' : 'AI-Powered Analysis'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6 max-w-lg mx-auto">
                {isES
                  ? `Genera un análisis histórico completo de la ${battle.name} con Claude AI — contexto, tácticas, consecuencias y bibliografía.`
                  : `Generate a complete historical analysis of ${battle.name} with Claude AI — context, tactics, consequences and bibliography.`
                }
              </p>
              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke mb-6">
                {isES ? `${queriesLeft} consultas gratuitas disponibles hoy` : `${queriesLeft} free queries available today`}
              </div>
              <button
                onClick={runQuery}
                className="btn-primary"
              >
                {isES ? '⚡ Analizar con IA' : '⚡ Analyze with AI'}
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate border border-gold/20 p-12 flex flex-col items-center gap-4">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
              <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke uppercase">
                {isES ? 'Analizando la batalla...' : 'Analyzing the battle...'}
              </p>
            </div>
          )}

          {rateLimited && (
            <div className="bg-slate border border-crimson/40 p-8 text-center">
              <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-crimson-light uppercase mb-3">
                {isES ? 'Límite diario alcanzado' : 'Daily limit reached'}
              </div>
              <p className="font-crimson italic text-smoke text-lg mb-6">
                {isES
                  ? 'Has utilizado tus 3 consultas gratuitas de hoy. Actualiza a Premium para consultas ilimitadas.'
                  : 'You have used your 3 free queries for today. Upgrade to Premium for unlimited queries.'
                }
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
              <div
                className="ai-content font-crimson text-parchment-dark text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: aiContent }}
              />
            </div>
          )}
        </div>

        {/* Related battles */}
        {related.length > 0 && (
          <div>
            <div className="eyebrow mb-4">
              {isES ? 'Batallas de la misma era' : 'Battles from the same era'}
            </div>
            <div className="battles-grid">
              {related.map((b, i) => (
                <Link
                  key={i}
                  href={`/${lang}/batallas/${slugify(b.name)}`}
                  className="card-bm block"
                >
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
