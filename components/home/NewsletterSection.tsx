'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NEWSLETTER SECTION
// Native form → /api/newsletter (Supabase)
// ═══════════════════════════════════════════════════════════

import { useState } from 'react'
import type { Lang } from '@/lib/data/types'

interface NewsletterSectionProps {
  lang: Lang
}

export function NewsletterSection({ lang }: NewsletterSectionProps) {
  const isES = lang === 'es'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id="newsletter"
      className="py-16 px-4 md:px-8 border-t border-b border-gold/10"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-4">
          📜 {isES ? 'Newsletter Semanal · Gratis' : 'Weekly Newsletter · Free'}
        </div>
        <h2 className="font-playfair font-bold text-cream text-3xl md:text-4xl mb-4">
          {isES ? 'La Batalla de la Semana' : 'Battle of the Week'}
        </h2>
        <p className="font-crimson italic text-smoke text-lg mb-8 max-w-xl mx-auto">
          {isES
            ? 'Cada martes: una batalla analizada en profundidad, un comandante olvidado, una táctica que cambió la historia. Lo que no te enseñaron en el colegio.'
            : 'Every Tuesday: one battle analyzed in depth, one forgotten commander, one tactic that changed history. What they never taught you in school.'
          }
        </p>

        {status === 'success' ? (
          <div className="max-w-[560px] mx-auto mb-4 border border-gold/30 bg-gold/5 p-6 text-center">
            <div className="text-2xl mb-2">✓</div>
            <div className="font-cinzel text-[0.65rem] tracking-[0.2em] text-gold uppercase mb-2">
              {isES ? '¡Suscrito!' : 'Subscribed!'}
            </div>
            <p className="font-crimson italic text-smoke text-base">
              {isES
                ? 'El próximo martes recibirás La Batalla de la Semana.'
                : 'Next Tuesday you will receive the Battle of the Week.'}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="max-w-[560px] mx-auto mb-4 flex gap-0 border border-gold/30"
            noValidate
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isES ? 'tu@email.com' : 'your@email.com'}
              required
              className="flex-1 bg-[#1A1814] px-4 py-3 font-crimson text-base text-cream placeholder:text-smoke outline-none border-none min-w-0"
              style={{ borderRight: '1px solid rgba(201,168,76,0.3)' }}
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-gold hover:bg-gold-light text-ink font-cinzel text-[0.65rem] tracking-[0.2em] uppercase px-5 py-3 font-bold transition-colors flex-shrink-0 flex items-center gap-2 disabled:opacity-70"
            >
              {status === 'loading' ? (
                <span className="flex gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-ink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-1.5 h-1.5 bg-ink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-1.5 h-1.5 bg-ink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (isES ? 'Suscribirse' : 'Subscribe')}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="font-cinzel text-[0.55rem] tracking-[0.15em] text-crimson-light uppercase mb-4">
            {isES ? 'Error — inténtalo de nuevo' : 'Error — please try again'}
          </p>
        )}

        <p className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase">
          {isES ? 'Sin spam · Cada martes · Baja cuando quieras' : 'No spam · Every Tuesday · Unsubscribe anytime'}
        </p>
      </div>
    </section>
  )
}
