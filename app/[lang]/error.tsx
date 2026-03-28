'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ERROR PAGE
// app/[lang]/error.tsx — catches runtime errors in [lang] subtree
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-gold uppercase mb-6">
        Error del sistema
      </div>
      <h1 className="font-playfair font-bold text-cream text-4xl md:text-5xl mb-4">
        Algo salió mal
      </h1>
      <p className="font-crimson italic text-smoke text-lg max-w-md mb-8">
        Se produjo un error inesperado. Nuestros archiveros ya están trabajando en ello.
      </p>
      <button
        onClick={reset}
        className="font-cinzel text-[0.65rem] tracking-[0.25em] uppercase bg-gold text-ink px-6 py-3 hover:bg-gold/90 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
