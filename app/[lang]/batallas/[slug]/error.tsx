'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BATTLE DETAIL ERROR BOUNDARY
// Shown when BattleDetailClient throws an unhandled error
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BattleError({ error, reset }: ErrorProps) {
  const pathname = usePathname()
  const lang = pathname.match(/^\/(es|en)/)?.[1] ?? 'es'
  const isEN = lang === 'en'

  useEffect(() => {
    console.error('[BattleDetail] Error boundary triggered:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="font-cinzel text-gold text-[0.65rem] tracking-[0.3em] uppercase mb-4">
        {isEN ? 'Error' : 'Error'}
      </div>
      <h1 className="font-playfair font-bold text-cream text-3xl mb-4">
        {isEN ? 'Could not load this battle' : 'No se pudo cargar esta batalla'}
      </h1>
      <p className="font-crimson text-smoke text-lg mb-8 max-w-md">
        {isEN
          ? 'Something went wrong while loading the battle details. You can try again or return to the index.'
          : 'Algo salió mal al cargar los detalles de la batalla. Puedes intentarlo de nuevo o volver al índice.'}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold bg-gold text-ink px-6 py-3 hover:bg-gold-light transition-colors"
        >
          {isEN ? 'Try again' : 'Intentar de nuevo'}
        </button>
        <Link
          href={`/${lang}/batallas`}
          className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold text-gold border border-gold/40 px-6 py-3 hover:bg-gold/10 transition-colors"
        >
          {isEN ? '← Back to battles' : '← Volver a batallas'}
        </Link>
      </div>
    </div>
  )
}
