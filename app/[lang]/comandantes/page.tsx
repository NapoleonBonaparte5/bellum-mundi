// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS INDEX PAGE
// /es/comandantes · /en/comandantes
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllCommanders } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { CommandersClient } from '@/components/commanders/CommandersClient'

interface CommandersPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: CommandersPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'Military Commanders' : 'Comandantes Militares',
    description: isEN
      ? '109 military commanders from all eras — from Alexander the Great to Eisenhower. Profiles and AI analysis.'
      : '109 comandantes militares de todas las eras — de Alejandro Magno a Eisenhower. Perfiles y análisis con IA.',
  }
}

export default async function CommandersPage({ params }: CommandersPageProps) {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  const commanders = getAllCommanders()
  const eraIds = ERAS.map(e => ({ id: e.id, name: e.name }))

  return (
    <div className="px-8 py-8 max-w-content mx-auto">
      <div className="mb-8">
        <div className="eyebrow mb-2">
          {isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-cream mb-3">
          👑 {isEN ? 'Military Commanders' : 'Comandantes Militares'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg">
          {isEN
            ? 'Complete index · Click any commander to view their full profile and AI analysis'
            : 'Índice completo · Haz clic en cualquier comandante para ver su perfil y análisis con IA'
          }
        </p>
      </div>
      <CommandersClient commanders={commanders} eras={eraIds} lang={l} />
    </div>
  )
}
