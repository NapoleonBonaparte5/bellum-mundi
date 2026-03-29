// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMMANDERS INDEX PAGE
// /es/comandantes · /en/comandantes
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { CommandersClient } from '@/components/commanders/CommandersClient'

export const revalidate = 3600

interface CommandersPageProps {
  params: Promise<{ lang: string }>
}

const BASE = 'https://bellummundi.com'

export async function generateMetadata({ params }: CommandersPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'Military Commanders' : 'Comandantes Militares',
    description: isEN
      ? '109 military commanders from all eras — from Alexander the Great to Eisenhower. Profiles and AI analysis.'
      : '109 comandantes militares de todas las eras — de Alejandro Magno a Eisenhower. Perfiles y análisis con IA.',
    alternates: {
      canonical: `${BASE}/${lang}/comandantes`,
      languages: {
        es: `${BASE}/es/comandantes`,
        en: `${BASE}/en/comandantes`,
        'x-default': `${BASE}/es/comandantes`,
      },
    },
  }
}

export default async function CommandersPage({ params }: CommandersPageProps) {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  return (
    <div className="px-4 md:px-8 pt-8 pb-4 max-w-content mx-auto">
      <div className="epic-header-wrap">
      <div className="index-header" style={{ width:'100%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="eyebrow mb-3 w-full text-center">
          {isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}
        </div>
        <h1 className="font-playfair font-bold text-cream mb-4 w-full text-center" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
          👑 {isEN ? 'Military Commanders' : 'Comandantes Militares'}
        </h1>
        <p className="font-crimson italic text-mist text-xl max-w-2xl mb-6 text-center mx-auto">
          {isEN
            ? 'Complete index · Click any commander to view their full profile and AI analysis'
            : 'Índice completo · Haz clic en cualquier comandante para ver su perfil y análisis con IA'
          }
        </p>
        <div className="gold-divider mx-auto" />
      </div>
      </div>
      <CommandersClient lang={l} />
    </div>
  )
}
