'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COLLECTION CLIENT (8C)
// Reads saved slugs from localStorage, displays saved battles
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Lang, FlatBattle } from '@/lib/data/types'
import { getAllBattles } from '@/lib/data/helpers'
import { getSaved, toggleSaved } from '@/lib/utils/collection'
import { translateYear, getBattleName, translateCombatants, autoTranslateDesc, getEraName } from '@/lib/i18n'
import type { EraId } from '@/lib/data/types'

interface ColeccionClientProps {
  lang: Lang
}

export function ColeccionClient({ lang }: ColeccionClientProps) {
  const isES = lang === 'es'
  const allBattles = useMemo(() => getAllBattles(), [])
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSavedSlugs(new Set(getSaved()))
    setMounted(true)
  }, [])

  const savedBattles: FlatBattle[] = useMemo(
    () => allBattles.filter(b => savedSlugs.has(b.slug)),
    [allBattles, savedSlugs]
  )

  const handleRemove = (slug: string) => {
    toggleSaved(slug)
    setSavedSlugs(prev => {
      const next = new Set(prev)
      next.delete(slug)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <div className="bg-gradient-to-b from-crimson/15 to-transparent px-6 py-16 max-w-content mx-auto">
        <nav className="mb-6 flex items-center gap-2 font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase">
          <Link href={`/${lang}`} className="hover:text-gold transition-colors">{isES ? 'Inicio' : 'Home'}</Link>
          <span>/</span>
          <span className="text-mist">{isES ? 'Mi Colección' : 'My Collection'}</span>
        </nav>
        <p className="eyebrow mb-4">{isES ? 'Historia Personal' : 'Personal History'}</p>
        <h1 className="font-cinzel font-black text-cream mb-4 leading-none" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          {isES ? '⭐ Mi Colección' : '⭐ My Collection'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg max-w-lg">
          {isES
            ? 'Tus batallas guardadas para estudio y referencia rápida.'
            : 'Your saved battles for study and quick reference.'}
        </p>
      </div>

      <div className="max-w-content mx-auto px-6 pb-16">
        {!mounted ? (
          <div className="py-16 text-center">
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        ) : savedBattles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-6 opacity-30">⭐</div>
            <p className="font-cinzel text-[0.65rem] tracking-[0.25em] text-smoke uppercase mb-4">
              {isES ? 'Tu colección está vacía' : 'Your collection is empty'}
            </p>
            <p className="font-crimson italic text-smoke text-lg mb-8 max-w-md mx-auto">
              {isES
                ? 'Guarda batallas desde el catálogo haciendo clic en el icono ☆ de cada tarjeta.'
                : 'Save battles from the catalog by clicking the ☆ icon on each card.'}
            </p>
            <Link href={`/${lang}/batallas`} className="btn-primary inline-block">
              {isES ? '⚔ Explorar Batallas' : '⚔ Explore Battles'}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="font-cinzel tracking-[0.15em] uppercase">
                <span className="text-gold font-bold text-lg">{savedBattles.length}</span>
                <span className="text-mist text-[0.72rem] ml-2">
                  {isES ? 'batallas guardadas' : 'saved battles'}
                </span>
              </div>
              <Link href={`/${lang}/batallas`} className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke hover:text-gold uppercase transition-colors">
                {isES ? '+ Añadir más →' : '+ Add more →'}
              </Link>
            </div>

            <div className="battles-grid">
              {savedBattles.map(battle => (
                <div key={battle.slug} className="relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(battle.slug)}
                    className="absolute top-2 right-2 z-10 text-gold hover:text-smoke transition-colors text-sm"
                    title={isES ? 'Quitar de colección' : 'Remove from collection'}
                    aria-label="Remove"
                  >
                    ⭐
                  </button>
                  <Link
                    href={`/${lang}/batallas/${battle.slug}`}
                    className="card-battle block"
                    data-era={battle.eraId}
                  >
                    <div className="card-year">{translateYear(lang, battle.year)}</div>
                    <div className="card-title line-clamp-2">{getBattleName(lang, battle.name)}</div>
                    <div className="card-combatants">{translateCombatants(lang, battle.combatants)}</div>
                    {battle.desc && (
                      <div className="card-desc line-clamp-2">{autoTranslateDesc(battle.desc, lang)}</div>
                    )}
                    <div className="mt-auto pt-3">
                      <span className="font-cinzel text-[0.55rem] tracking-wider text-gold/50 uppercase">
                        {getEraName(lang, battle.eraId as EraId, battle.eraName)}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
