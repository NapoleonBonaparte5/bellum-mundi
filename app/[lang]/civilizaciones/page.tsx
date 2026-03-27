// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATIONS PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllCivs } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { CivsClient } from '@/components/civs/CivsClient'

interface CivsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: CivsPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'Military Civilizations' : 'Civilizaciones Militares',
    description: isEN
      ? 'Military civilizations from all eras — power ratings, periods and battles.'
      : 'Civilizaciones militares de todas las eras — poder militar, períodos y batallas.',
  }
}

export default async function CivsPage({ params }: CivsPageProps) {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  const civs = getAllCivs()
  const eraIds = ERAS.map(e => ({ id: e.id, name: e.name }))

  return (
    <div className="px-8 py-8 max-w-content mx-auto">
      <div className="mb-8">
        <div className="eyebrow mb-2">{isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}</div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-cream mb-3">
          🏛️ {isEN ? 'Civilizations' : 'Civilizaciones'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg">
          {isEN
            ? 'Military powers through history — from Sumer to the 21st century'
            : 'Potencias militares a través de la historia — de Sumer al siglo XXI'
          }
        </p>
      </div>
      <CivsClient civs={civs} eras={eraIds} lang={l} />
    </div>
  )
}
