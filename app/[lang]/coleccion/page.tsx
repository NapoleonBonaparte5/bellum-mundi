// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — MY COLLECTION PAGE (8C)
// Personal saved battles from localStorage
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { ColeccionClient } from '@/components/coleccion/ColeccionClient'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en' ? 'My Collection — Bellum Mundi' : 'Mi Colección — Bellum Mundi',
    description: lang === 'en'
      ? 'Your saved battles and personal military history collection.'
      : 'Tus batallas guardadas y colección personal de historia militar.',
  }
}

export default async function ColeccionPage({ params }: PageProps) {
  const { lang } = await params
  return <ColeccionClient lang={lang} />
}
