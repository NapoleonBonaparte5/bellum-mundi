'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — 404 NOT FOUND PAGE
// app/[lang]/not-found.tsx — language-aware via usePathname
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()
  const lang = pathname?.startsWith('/en') ? 'en' : 'es'
  const isEN = lang === 'en'

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="font-cinzel text-[0.55rem] tracking-[0.35em] text-gold uppercase mb-6">
        {isEN ? '404 — Page not found' : '404 — Página no encontrada'}
      </div>
      <h1 className="font-playfair font-bold text-cream text-5xl md:text-7xl mb-2">
        404
      </h1>
      <p className="font-crimson italic text-smoke text-xl max-w-md mb-8 mt-4">
        {isEN
          ? 'This battle is not in our records. History may have erased it, or the URL might be incorrect.'
          : 'Esta batalla no figura en nuestros archivos. Puede que la historia la haya borrado, o simplemente que la URL sea incorrecta.'
        }
      </p>
      <div className="flex gap-4">
        <Link
          href={`/${lang}`}
          className="font-cinzel text-[0.65rem] tracking-[0.25em] uppercase bg-gold text-ink px-6 py-3 hover:bg-gold/90 transition-colors"
        >
          {isEN ? 'Back to home' : 'Volver al inicio'}
        </Link>
        <Link
          href={`/${lang}/batallas`}
          className="font-cinzel text-[0.65rem] tracking-[0.25em] uppercase border border-gold/40 text-gold px-6 py-3 hover:border-gold/70 transition-colors"
        >
          {isEN ? 'View battles' : 'Ver batallas'}
        </Link>
      </div>
    </div>
  )
}
