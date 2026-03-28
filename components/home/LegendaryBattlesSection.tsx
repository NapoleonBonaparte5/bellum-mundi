'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LEGENDARY BATTLES SECTION (B5)
// 6 legendary battles — 3×2 grid, cinematic cards
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Lang } from '@/lib/data/types'

interface LegendaryBattle {
  slug: string
  nameES: string
  nameEN: string
  year: string
  eraId: string
  eraLabelES: string
  eraLabelEN: string
  factES: string
  factEN: string
  color: string
  glow: string
}

const LEGENDARY: LegendaryBattle[] = [
  {
    slug: 'batalla-de-cannas',
    nameES: 'Batalla de Cannas',
    nameEN: 'Battle of Cannae',
    year: '216 a.C.',
    eraId: 'ancient',
    eraLabelES: 'Antigüedad',
    eraLabelEN: 'Antiquity',
    factES: '70.000 romanos aniquilados — el envolvimiento perfecto de Aníbal',
    factEN: '70,000 Romans annihilated — Hannibal\'s perfect double encirclement',
    color: '#C9A84C',
    glow: 'rgba(201,168,76,0.2)',
  },
  {
    slug: 'batalla-de-las-termopilas',
    nameES: 'Batalla de las Termópilas',
    nameEN: 'Battle of Thermopylae',
    year: '480 a.C.',
    eraId: 'classical',
    eraLabelES: 'Era Clásica',
    eraLabelEN: 'Classical',
    factES: '300 espartanos detuvieron al mayor ejército del mundo conocido',
    factEN: '300 Spartans held off the largest army the known world had ever seen',
    color: '#8B1A1A',
    glow: 'rgba(139,26,26,0.25)',
  },
  {
    slug: 'batalla-de-hastings',
    nameES: 'Batalla de Hastings',
    nameEN: 'Battle of Hastings',
    year: '1066',
    eraId: 'medieval',
    eraLabelES: 'Edad Media',
    eraLabelEN: 'Middle Ages',
    factES: 'Un día que transformó para siempre la lengua y la cultura inglesa',
    factEN: 'One day that forever transformed the English language and culture',
    color: '#4A6B8A',
    glow: 'rgba(74,107,138,0.2)',
  },
  {
    slug: 'batalla-de-lepanto',
    nameES: 'Batalla de Lepanto',
    nameEN: 'Battle of Lepanto',
    year: '1571',
    eraId: 'early_modern',
    eraLabelES: 'Edad Moderna',
    eraLabelEN: 'Early Modern',
    factES: '400 galeras — la mayor batalla naval del Mediterráneo en 2.000 años',
    factEN: '400 galleys — the greatest naval battle in the Mediterranean in 2,000 years',
    color: '#6B4C8A',
    glow: 'rgba(107,76,138,0.2)',
  },
  {
    slug: 'batalla-de-waterloo',
    nameES: 'Batalla de Waterloo',
    nameEN: 'Battle of Waterloo',
    year: '1815',
    eraId: 'napoleon',
    eraLabelES: 'Era Napoleónica',
    eraLabelEN: 'Napoleonic',
    factES: '200.000 soldados — el fin del dominio napoleónico de Europa',
    factEN: '200,000 soldiers — the end of Napoleon\'s dominion over Europe',
    color: '#E8C97A',
    glow: 'rgba(232,201,122,0.18)',
  },
  {
    slug: 'batalla-de-stalingrado',
    nameES: 'Batalla de Stalingrado',
    nameEN: 'Battle of Stalingrad',
    year: '1942–43',
    eraId: 'ww2',
    eraLabelES: 'Segunda Guerra Mundial',
    eraLabelEN: 'World War II',
    factES: '2 millones de bajas — el punto de inflexión de la Segunda Guerra Mundial',
    factEN: '2 million casualties — the turning point of World War II',
    color: '#9B9590',
    glow: 'rgba(155,149,144,0.18)',
  },
]

interface LegendaryBattlesSectionProps {
  lang: Lang
}

export function LegendaryBattlesSection({ lang }: LegendaryBattlesSectionProps) {
  const isES = lang === 'es'

  return (
    <section className="legendary-section py-16 px-4 md:px-8">
      <div className="max-w-content mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">{isES ? 'Historia Épica' : 'Epic History'}</p>
          <h2
            className="font-cinzel font-black text-cream mb-4 leading-none"
            style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}
          >
            {isES ? 'Batallas Legendarias' : 'Legendary Battles'}
          </h2>
          <p className="font-crimson italic text-smoke text-lg max-w-xl mx-auto">
            {isES
              ? 'Los seis enfrentamientos que cambiaron el curso de la historia humana'
              : 'Six confrontations that changed the course of human history'}
          </p>
        </div>

        {/* 3×2 grid */}
        <div className="legendary-grid">
          {LEGENDARY.map((battle) => (
            <Link
              key={battle.slug}
              href={`/${lang}/batallas/${battle.slug}`}
              className="legendary-card block"
              style={{
                '--lc-color': battle.color,
                '--lc-glow': battle.glow,
              } as React.CSSProperties}
            >
              {/* Era badge */}
              <div className="legendary-card-era">
                {isES ? battle.eraLabelES : battle.eraLabelEN}
              </div>

              {/* Year */}
              <div className="legendary-card-year">{battle.year}</div>

              {/* Name */}
              <div className="legendary-card-name">
                {isES ? battle.nameES : battle.nameEN}
              </div>

              {/* Fact */}
              <div className="legendary-card-fact">
                {isES ? battle.factES : battle.factEN}
              </div>

              {/* CTA */}
              <div className="legendary-card-cta">
                {isES ? 'Ver análisis →' : 'View analysis →'}
              </div>

              {/* Decorative top-left corner mark */}
              <div className="legendary-card-corner tl" />
              <div className="legendary-card-corner br" />
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-8">
          <Link
            href={`/${lang}/batallas`}
            className="btn-ghost inline-block"
            style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}
          >
            {isES ? '⚔ Ver todas las batallas →' : '⚔ Browse all battles →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
