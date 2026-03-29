// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SUCCESS PAGE
// /[lang]/success?session_id=... — after Stripe payment
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'

interface SuccessPageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en' ? 'Welcome to Premium! — Bellum Mundi' : '¡Bienvenido a Premium! — Bellum Mundi',
    robots: { index: false },
  }
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { lang } = await params
  const isEN = lang === 'en'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-16">
        <div className="text-6xl mb-6">⚔</div>
        <div className="font-cinzel text-[0.65rem] tracking-[0.4em] text-gold uppercase mb-4">
          {isEN ? 'Welcome to the Commander plan!' : '¡Bienvenido al plan Commander!'}
        </div>
        <h1 className="font-playfair font-black text-cream text-4xl mb-4">
          {isEN ? 'Payment complete' : 'Pago completado'}
        </h1>
        <p className="font-crimson italic text-parchment-dark text-xl mb-8">
          {isEN
            ? 'Your Premium account is active. You now have unlimited access to all AI analyses, bibliography and the exclusive newsletter.'
            : 'Tu cuenta Premium está activa. Ahora tienes acceso ilimitado a todos los análisis con IA, bibliografía y newsletter exclusivo.'
          }
        </p>
        <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-8" />
        <Link href={`/${lang}`} className="btn-primary inline-block">
          {isEN ? 'Explore Bellum Mundi →' : 'Explorar Bellum Mundi →'}
        </Link>
      </div>
    </div>
  )
}
