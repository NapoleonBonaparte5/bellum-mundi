// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — VIRTUAL 3D MUSEUM PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { ERAS } from '@/lib/data/eras'
import { VirtualMuseum } from '@/components/museo/VirtualMuseum'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en'
      ? 'Virtual Military Museum — Bellum Mundi'
      : 'Museo Militar Virtual — Bellum Mundi',
    description: lang === 'en'
      ? 'Explore historical weapons in an interactive 3D museum. Click any artifact for AI analysis.'
      : 'Explora armas históricas en un museo 3D interactivo. Haz clic en cualquier artefacto para análisis con IA.',
  }
}

export default async function MuseoPage({ params }: PageProps) {
  const { lang } = await params
  // Pass all era weapon data to the museum
  const eraData = ERAS.map(era => ({
    id: era.id,
    name: era.name,
    years: era.years,
    weapons: era.weapons.slice(0, 8), // max 8 items per room
  }))
  return <VirtualMuseum lang={lang} eraData={eraData} />
}
