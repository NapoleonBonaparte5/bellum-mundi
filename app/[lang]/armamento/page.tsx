// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WEAPONS DATABASE PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllWeapons } from '@/lib/data/helpers'
import { WeaponsClient } from '@/components/armamento/WeaponsClient'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en'
      ? 'Military Weapons Database — Bellum Mundi'
      : 'Base de Datos de Armamento Militar — Bellum Mundi',
    description: lang === 'en'
      ? 'Explore 400+ historical military weapons from the Paleolithic to the 21st century. AI analysis included.'
      : 'Explora 400+ armas militares históricas desde el Paleolítico hasta el siglo XXI. Análisis con IA incluido.',
  }
}

export default async function ArmamentoPage({ params }: PageProps) {
  const { lang } = await params
  const weapons = getAllWeapons()
  return <WeaponsClient lang={lang} weapons={weapons} />
}
