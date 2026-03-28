// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — EDITORIAL SECTION
// 4 asymmetric editorial blocks — NVIDIA-style layout
// Left: title + description + link | Right: 2 feature cards
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Lang } from '@/lib/data/types'

interface EditorialBlock {
  icon: string
  titleEN: string
  titleES: string
  descEN: string
  descES: string
  linkEN: string
  linkES: string
  href: string
  cards: { icon: string; titleEN: string; titleES: string; descEN: string; descES: string }[]
}

const BLOCKS: EditorialBlock[] = [
  {
    icon: '⚔',
    titleEN: 'AI Battle Analysis',
    titleES: 'Análisis de Batallas con IA',
    descEN: 'Every battle comes with deep AI-generated analysis — tactics used, strategic context, key commanders, consequences and counterfactual "what-if" scenarios that no textbook covers.',
    descES: 'Cada batalla incluye análisis profundo generado por IA: tácticas, contexto estratégico, comandantes clave, consecuencias y escenarios contrafactuales que ningún libro de texto cubre.',
    linkEN: 'Explore a Battle →',
    linkES: 'Explorar una Batalla →',
    href: '/batallas/batalla-de-waterloo',
    cards: [
      { icon: '🧠', titleEN: 'Tactical Breakdown', titleES: 'Análisis Táctico', descEN: 'Formation, terrain, logistics and decision-making analyzed by AI.', descES: 'Formación, terreno, logística y toma de decisiones analizados.' },
      { icon: '📊', titleEN: 'Historical Impact', titleES: 'Impacto Histórico', descEN: 'How each battle reshaped borders, dynasties and military doctrine.', descES: 'Cómo cada batalla redefinió fronteras, dinastías y doctrina militar.' },
    ],
  },
  {
    icon: '⚖',
    titleEN: 'Battle Comparison Mode',
    titleES: 'Modo Comparación de Batallas',
    descEN: 'Select any two battles from any era — ancient Greek phalanx vs WWI trenches — and get an AI-powered side-by-side analysis of strategies, force sizes, outcomes and lasting significance.',
    descES: 'Selecciona dos batallas de cualquier era — falange griega vs trincheras de la I Guerra Mundial — y obtén una comparación IA: estrategias, fuerzas, resultados e impacto duradero.',
    linkEN: 'Try Comparison Mode →',
    linkES: 'Probar Modo Comparación →',
    href: '/batallas',
    cards: [
      { icon: '🔬', titleEN: 'Cross-Era Analysis', titleES: 'Análisis Transversal', descEN: 'Compare battles separated by 3,000 years of military evolution.', descES: 'Compara batallas separadas por 3.000 años de evolución militar.' },
      { icon: '📈', titleEN: 'Force Metrics', titleES: 'Métricas de Fuerza', descEN: 'Troop counts, technology, morale and supply lines side by side.', descES: 'Tropas, tecnología, moral y líneas de suministro cara a cara.' },
    ],
  },
  {
    icon: '🏛',
    titleEN: 'Military Power Rankings',
    titleES: 'Ranking de Poder Militar',
    descEN: '118 civilizations ranked by a 7-metric military power system — territory, duration, victories, innovation, projection, economy and legacy. From Sumer to 21st-century superpowers.',
    descES: '118 civilizaciones rankeadas por un sistema de 7 métricas militares: territorio, duración, victorias, innovación, proyección, economía y legado. De Sumer a las superpotencias del siglo XXI.',
    linkEN: 'View All Rankings →',
    linkES: 'Ver Todos los Rankings →',
    href: '/civilizaciones',
    cards: [
      { icon: '🎯', titleEN: '7-Metric System', titleES: 'Sistema de 7 Métricas', descEN: 'Scientific scoring based on documented historical evidence.', descES: 'Puntuación científica basada en evidencia histórica documentada.' },
      { icon: '🏆', titleEN: 'Era Champions', titleES: 'Campeones por Era', descEN: 'See which civilization dominated each period of history.', descES: 'Qué civilización dominó cada período de la historia.' },
    ],
  },
  {
    icon: '🗺',
    titleEN: 'Interactive War Map',
    titleES: 'Mapa Mundial Interactivo',
    descEN: 'Every battle with known coordinates pinned on an interactive world map. Filter by era and watch 12,000 years of warfare unfold geographically — from Mesopotamia to Ukraine.',
    descES: 'Cada batalla con coordenadas conocidas marcada en un mapa mundial interactivo. Filtra por era y observa 12.000 años de guerra desplegarse geográficamente — de Mesopotamia a Ucrania.',
    linkEN: 'Open World Map →',
    linkES: 'Abrir Mapa Mundial →',
    href: '/mapa',
    cards: [
      { icon: '📍', titleEN: 'Geolocated Battles', titleES: 'Batallas Geolocalizadas', descEN: 'Click any pin to see battle details and AI analysis.', descES: 'Haz clic en cualquier marcador para ver detalles y análisis IA.' },
      { icon: '🔍', titleEN: 'Era Filter', titleES: 'Filtro por Era', descEN: 'Isolate any historical period on the map in one click.', descES: 'Aísla cualquier período histórico en el mapa con un clic.' },
    ],
  },
]

interface EditorialSectionProps {
  lang: Lang
}

export function EditorialSection({ lang }: EditorialSectionProps) {
  const isES = lang === 'es'

  return (
    <section className="py-8 px-4 md:px-8" id="editorial">
      <div className="max-w-content mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <p className="eyebrow mb-3">{isES ? 'Funcionalidades' : 'Features'}</p>
          <h2
            className="font-playfair font-bold text-cream"
            style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', maxWidth: '700px' }}
          >
            {isES
              ? 'La enciclopedia militar más completa del mundo'
              : 'The world\'s most complete military encyclopedia'}
          </h2>
        </div>

        {/* Editorial blocks */}
        <div className="flex flex-col">
          {BLOCKS.map((block, i) => (
            <div key={i}>
              {/* Divider */}
              <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.25), transparent)' }} />

              {/* Block */}
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-12"
                style={{ alignItems: 'start' }}
              >
                {/* Left: title + desc + link */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{block.icon}</span>
                    <h3
                      className="font-playfair font-bold text-cream"
                      style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', lineHeight: 1.2 }}
                    >
                      {isES ? block.titleES : block.titleEN}
                    </h3>
                  </div>
                  <p
                    className="font-crimson text-mist"
                    style={{ fontSize: '1rem', lineHeight: 1.75, maxWidth: '480px' }}
                  >
                    {isES ? block.descES : block.descEN}
                  </p>
                  <Link
                    href={`/${lang}${block.href}`}
                    className="editorial-link font-cinzel text-gold hover:text-gold-light transition-colors flex items-center gap-2"
                    style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
                  >
                    {isES ? block.linkES : block.linkEN}
                  </Link>
                </div>

                {/* Right: 2 feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: 'rgba(201,168,76,0.06)' }}>
                  {block.cards.map((card, j) => (
                    <div
                      key={j}
                      className="editorial-card bg-slate p-6 flex flex-col gap-3"
                      style={{ borderLeft: '2px solid transparent', transition: 'border-color 0.2s ease, background 0.2s ease' }}
                    >
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{card.icon}</span>
                      <h4
                        className="font-playfair font-bold text-cream"
                        style={{ fontSize: '0.95rem', lineHeight: 1.3 }}
                      >
                        {isES ? card.titleES : card.titleEN}
                      </h4>
                      <p
                        className="font-crimson text-mist"
                        style={{ fontSize: '0.85rem', lineHeight: 1.6 }}
                      >
                        {isES ? card.descES : card.descEN}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Final divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,168,76,0.25), transparent)' }} />
        </div>
      </div>
    </section>
  )
}
