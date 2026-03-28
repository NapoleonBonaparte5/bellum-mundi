// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CIVILIZATIONS PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllCivs } from '@/lib/data/helpers'

export const revalidate = 3600
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
    <div className="px-4 md:px-8 pt-8 pb-4 max-w-content mx-auto">
      <div className="index-header mb-6" style={{ width:'100%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="eyebrow mb-3 w-full text-center">{isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}</div>
        <h1 className="font-playfair font-bold text-cream mb-4 w-full text-center" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
          🏛️ {isEN ? 'Civilizations' : 'Civilizaciones'}
        </h1>
        <p className="font-crimson italic text-mist text-xl max-w-2xl mb-6 text-center mx-auto">
          {isEN
            ? 'Military powers through history — from Sumer to the 21st century'
            : 'Potencias militares a través de la historia — de Sumer al siglo XXI'
          }
        </p>
        <div className="gold-divider mx-auto" />
      </div>
      <CivsClient civs={civs} eras={eraIds} lang={l} />
    </div>
  )
}
