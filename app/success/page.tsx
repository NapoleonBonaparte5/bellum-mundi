// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SUCCESS PAGE
// /success?session_id=... — after Stripe payment
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¡Bienvenido a Premium! — Bellum Mundi',
  robots: { index: false },
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center py-16">
        <div className="text-6xl mb-6">⚔</div>
        <div className="font-cinzel text-[0.65rem] tracking-[0.4em] text-gold uppercase mb-4">
          ¡Bienvenido al plan Commander!
        </div>
        <h1 className="font-playfair font-black text-cream text-4xl mb-4">
          Pago completado
        </h1>
        <p className="font-crimson italic text-parchment-dark text-xl mb-8">
          Tu cuenta Premium está activa. Ahora tienes acceso ilimitado a todos los análisis con IA, bibliografía y newsletter exclusivo.
        </p>
        <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mb-8" />
        <Link
          href="/es"
          className="btn-primary inline-block"
        >
          Explorar Bellum Mundi →
        </Link>
      </div>
    </div>
  )
}
