// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — FEATURES SECTION
// 6-feature grid showcasing core functionality
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Lang } from '@/lib/data/types'

interface Feature {
  icon: string
  title: string
  desc: string
  cta: string
  href: string
}

const FEATURES: Record<Lang, Feature[]> = {
  en: [
    {
      icon: '🤖',
      title: 'AI Battle Analysis',
      desc: 'Every battle comes with deep AI-generated analysis covering tactics, consequences, commanders and historical context — far beyond any textbook.',
      cta: 'Explore a Battle →',
      href: '/en/batallas/batalla-de-waterloo',
    },
    {
      icon: '⚖',
      title: 'Battle Comparison Mode',
      desc: 'Select any two battles from any era and get a side-by-side AI comparison of strategies, forces, outcomes and historical significance.',
      cta: 'Compare Battles →',
      href: '/en/batallas',
    },
    {
      icon: '🏛️',
      title: 'Military Power Rankings',
      desc: '118 civilizations ranked by military power with historical scores — from Sumer to the 21st century. See who truly dominated their era.',
      cta: 'View Rankings →',
      href: '/en/civilizaciones',
    },
    {
      icon: '🗺️',
      title: 'Interactive World Map',
      desc: 'Explore 890+ battles pinned on an interactive map. Filter by era and watch history unfold geographically across 12,000 years of warfare.',
      cta: 'Open Map →',
      href: '/en/mapa',
    },
    {
      icon: '👑',
      title: 'Commander Profiles',
      desc: 'In-depth profiles of 500+ military commanders — their victories, defeats, strategies and lasting impact on the art of war.',
      cta: 'Browse Commanders →',
      href: '/en/comandantes',
    },
    {
      icon: '📜',
      title: 'Military Library',
      desc: 'Treaties, primary sources and works that defined warfare — from Sun Tzu\'s Art of War to the Geneva Conventions.',
      cta: 'Open Library →',
      href: '/en/biblioteca',
    },
  ],
  es: [
    {
      icon: '🤖',
      title: 'Análisis de Batallas con IA',
      desc: 'Cada batalla incluye análisis profundo generado por IA: tácticas, consecuencias, comandantes y contexto histórico completo.',
      cta: 'Explorar una Batalla →',
      href: '/es/batallas/batalla-de-waterloo',
    },
    {
      icon: '⚖',
      title: 'Modo Comparación',
      desc: 'Selecciona dos batallas de cualquier era y obtén una comparación IA cara a cara: estrategias, fuerzas, resultados e impacto histórico.',
      cta: 'Comparar Batallas →',
      href: '/es/batallas',
    },
    {
      icon: '🏛️',
      title: 'Ranking de Poder Militar',
      desc: '118 civilizaciones rankeadas por poder militar con puntuaciones históricas — desde Sumer hasta el siglo XXI.',
      cta: 'Ver Rankings →',
      href: '/es/civilizaciones',
    },
    {
      icon: '🗺️',
      title: 'Mapa Mundial Interactivo',
      desc: 'Más de 890 batallas en un mapa interactivo. Filtra por era y observa la historia desplegarse en 12.000 años de conflictos.',
      cta: 'Abrir Mapa →',
      href: '/es/mapa',
    },
    {
      icon: '👑',
      title: 'Perfiles de Comandantes',
      desc: 'Perfiles detallados de más de 500 comandantes militares: victorias, derrotas, estrategias e impacto duradero en el arte de la guerra.',
      cta: 'Ver Comandantes →',
      href: '/es/comandantes',
    },
    {
      icon: '📜',
      title: 'Biblioteca Militar',
      desc: 'Tratados, fuentes primarias y obras que definieron la guerra — del Arte de la Guerra de Sun Tzu a los Convenios de Ginebra.',
      cta: 'Abrir Biblioteca →',
      href: '/es/biblioteca',
    },
  ],
}

interface FeaturesSectionProps {
  lang: Lang
}

export function FeaturesSection({ lang }: FeaturesSectionProps) {
  const items = FEATURES[lang]
  const isES = lang === 'es'

  return (
    <section className="py-20 px-4 md:px-8" id="features">
      <div className="max-w-content mx-auto">
        {/* Eyebrow + title */}
        <div className="text-center mb-14">
          <p className="eyebrow mb-4">{isES ? 'Funcionalidades' : 'What You Get'}</p>
          <h2
            className="font-playfair font-bold text-cream"
            style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}
          >
            {isES
              ? 'Todo lo que necesitas para dominar la historia militar'
              : 'Everything you need to master military history'}
          </h2>
          <div className="gold-rule-h mt-5" />
        </div>

        {/* 3-col feature grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ gap: '1px', background: 'rgba(201,168,76,0.08)' }}
        >
          {items.map((f, i) => (
            <div
              key={i}
              className="feature-card bg-slate p-8 flex flex-col gap-3"
            >
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{f.icon}</span>
              <h3 className="font-playfair font-bold text-cream" style={{ fontSize: '1.15rem', lineHeight: 1.25 }}>
                {f.title}
              </h3>
              <p className="font-crimson text-mist" style={{ fontSize: '0.95rem', lineHeight: 1.7, flex: 1 }}>
                {f.desc}
              </p>
              <Link
                href={f.href}
                className="font-cinzel text-gold hover:text-gold-light transition-colors"
                style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                {f.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
