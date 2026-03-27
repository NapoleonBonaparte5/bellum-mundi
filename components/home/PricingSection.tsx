'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — PRICING SECTION
// 3 plans: Free · Commander (monthly/annual) · Institutional
// ═══════════════════════════════════════════════════════════

import { useState } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'

const STRIPE_PRICE_MONTHLY = 'price_1TEremLQnw3S1NGVUciHDGGH'
const STRIPE_PRICE_ANNUAL  = 'price_1TErfcLQnw3S1NGVNa7flWZ7'

interface PricingSectionProps {
  lang: Lang
}

function Check() {
  return <span className="text-emerald-light font-bold flex-shrink-0">✓</span>
}
function Cross() {
  return <span className="text-smoke opacity-40 flex-shrink-0">✗</span>
}

export function PricingSection({ lang }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)

  const isES = lang === 'es'

  async function handleCheckout() {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError(isES ? 'Introduce un email válido' : 'Enter a valid email')
      return
    }
    setEmailError('')
    setLoading(true)
    try {
      const priceId = annual ? STRIPE_PRICE_ANNUAL : STRIPE_PRICE_MONTHLY
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: trimmed }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setEmailError(isES ? 'Error al procesar. Inténtalo de nuevo.' : 'Error processing. Try again.')
    } catch {
      setEmailError(isES ? 'Error al procesar. Inténtalo de nuevo.' : 'Error processing. Try again.')
    }
    setLoading(false)
  }

  const monthlyPrice = annual ? '4.19' : '6.99'
  const annualTotal = '50.28'

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="text-center mb-12">
        <div className="eyebrow mb-4">{t(lang, 'pricing_eyebrow')}</div>
        <h2 className="font-playfair font-bold text-cream mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          {t(lang, 'pricing_title')}
        </h2>
        <p className="font-crimson italic text-smoke text-lg">{t(lang, 'pricing_desc')}</p>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`font-cinzel text-[0.65rem] tracking-[0.2em] uppercase transition-colors ${!annual ? 'text-gold' : 'text-smoke'}`}>
            {isES ? 'Mensual' : 'Monthly'}
          </span>
          <button
            onClick={() => setAnnual(a => !a)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-gold/20' : 'bg-ash'}`}
            aria-checked={annual}
            role="switch"
            aria-label={isES ? 'Facturación anual' : 'Annual billing'}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gold transition-transform ${annual ? 'translate-x-6' : ''}`}
            />
          </button>
          <span className={`font-cinzel text-[0.65rem] tracking-[0.2em] uppercase transition-colors ${annual ? 'text-gold' : 'text-smoke'}`}>
            {isES ? 'Anual' : 'Annual'}
          </span>
          {annual && (
            <span className="bg-emerald text-cream font-cinzel text-[0.5rem] tracking-[0.15em] px-2 py-0.5 uppercase font-bold">
              {t(lang, 'plan_annual_badge')}
            </span>
          )}
        </div>
      </div>

      <div className="pricing-grid">
        {/* FREE */}
        <div className="bg-slate p-10">
          <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-4">
            {t(lang, 'plan_free_name')}
          </div>
          <div className="font-playfair font-black text-cream text-5xl leading-none mb-1">
            <sup className="text-xl text-smoke">€</sup>0
          </div>
          <div className="font-cinzel text-[0.6rem] tracking-[0.15em] text-smoke uppercase mb-1">
            {t(lang, 'plan_free_price')}
          </div>
          <div className="font-crimson italic text-smoke text-sm mb-6 min-h-[1.2em]"> </div>
          <div className="h-px bg-gold/15 mb-6" />
          <ul className="space-y-3 mb-8">
            {[
              { ok: true,  text: isES ? 'Navegación completa por eras' : 'Full era navigation' },
              { ok: true,  text: isES ? 'Mapa interactivo de batallas' : 'Interactive battle map' },
              { ok: true,  text: isES ? '3 consultas IA por día' : '3 AI queries per day' },
              { ok: false, text: isES ? 'Análisis históricos ilimitados' : 'Unlimited AI analysis' },
              { ok: false, text: isES ? 'Bibliografía recomendada' : 'Recommended bibliography' },
              { ok: false, text: isES ? 'Newsletter premium semanal' : 'Weekly premium newsletter' },
              { ok: false, text: isES ? 'Sin publicidad' : 'Ad-free experience' },
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-3 font-crimson text-[0.95rem] ${item.ok ? 'text-mist' : 'text-smoke opacity-40'}`}>
                {item.ok ? <Check /> : <Cross />}
                {item.text}
              </li>
            ))}
          </ul>
          <button className="w-full py-4 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold text-mist border border-gold/20 hover:border-gold hover:text-gold transition-colors">
            {isES ? 'Crear cuenta gratis' : 'Create free account'}
          </button>
        </div>

        {/* PREMIUM — featured */}
        <div className="relative p-10"
          style={{ background: 'linear-gradient(160deg,rgba(139,26,26,0.2),rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.3)' }}
        >
          {/* Popular badge */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gold text-ink font-cinzel text-[0.5rem] tracking-[0.2em] px-4 py-1 font-bold uppercase">
            {t(lang, 'plan_premium_badge')}
          </div>

          <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-4 mt-2">
            {t(lang, 'plan_premium_name')}
          </div>
          <div className="font-playfair font-black text-cream text-5xl leading-none mb-1">
            <sup className="text-xl text-smoke">€</sup>{monthlyPrice}
          </div>
          <div className="font-cinzel text-[0.6rem] tracking-[0.15em] text-smoke uppercase mb-1">
            {isES ? 'por mes' : 'per month'}
          </div>
          <div className="font-crimson italic text-sm mb-6 min-h-[1.2em]"
            style={{ color: annual ? 'var(--emerald-light)' : 'transparent' }}
          >
            {annual ? (isES ? `€${annualTotal} al año — ahorras €33.6` : `€${annualTotal}/year — save €33.6`) : ' '}
          </div>
          <div className="h-px bg-gold/15 mb-6" />
          <ul className="space-y-3 mb-8">
            {[
              isES ? 'Todo lo del plan Explorador' : 'Everything in Explorer',
              isES ? 'Consultas IA ilimitadas' : 'Unlimited AI queries',
              isES ? 'Análisis exhaustivos completos' : 'Full exhaustive analysis',
              isES ? 'Bibliografía & libros recomendados' : 'Bibliography & book recommendations',
              isES ? 'Newsletter semanal exclusivo' : 'Exclusive weekly newsletter',
              isES ? 'Sin publicidad nunca' : 'Never any ads',
              isES ? 'Acceso anticipado a nuevas eras' : 'Early access to new eras',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 font-crimson text-[0.95rem] text-mist">
                <Check /> {text}
              </li>
            ))}
          </ul>
          {showEmailForm ? (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCheckout()}
                placeholder={isES ? 'tu@email.com' : 'your@email.com'}
                className="w-full bg-ink/60 border border-gold/30 text-cream font-crimson text-sm px-4 py-3 placeholder:text-smoke focus:outline-none focus:border-gold transition-colors"
                autoFocus
                disabled={loading}
              />
              {emailError && (
                <p className="font-cinzel text-[0.55rem] tracking-[0.15em] text-crimson-light uppercase">{emailError}</p>
              )}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold bg-gold text-ink hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? (isES ? 'Procesando...' : 'Processing...')
                  : (isES ? 'Pagar con Stripe →' : 'Pay with Stripe →')
                }
              </button>
              <button
                onClick={() => { setShowEmailForm(false); setEmailError('') }}
                className="w-full py-2 font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-smoke hover:text-mist transition-colors"
              >
                {isES ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-4 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold bg-gold text-ink hover:bg-gold-light transition-colors"
            >
              {isES ? 'Comenzar ahora →' : 'Start now →'}
            </button>
          )}
        </div>

        {/* INSTITUTIONAL */}
        <div className="bg-slate p-10">
          <div className="font-cinzel text-[0.65rem] tracking-[0.3em] text-gold uppercase mb-4">
            {isES ? 'Institucional' : 'Institutional'}
          </div>
          <div className="font-playfair font-black text-cream text-5xl leading-none mb-1">
            <sup className="text-xl text-smoke">€</sup>299
          </div>
          <div className="font-cinzel text-[0.6rem] tracking-[0.15em] text-smoke uppercase mb-1">
            {isES ? 'por año / institución' : 'per year / institution'}
          </div>
          <div className="font-crimson italic text-smoke text-sm mb-6">
            {isES ? 'Academias, museos, centros educativos' : 'Academies, museums, schools'}
          </div>
          <div className="h-px bg-gold/15 mb-6" />
          <ul className="space-y-3 mb-8">
            {[
              isES ? 'Hasta 50 usuarios simultáneos' : 'Up to 50 simultaneous users',
              isES ? 'Todo el plan Comandante' : 'Full Commander plan',
              isES ? 'Panel de administración' : 'Admin dashboard',
              isES ? 'Exportación de contenido (PDF)' : 'Content export (PDF)',
              isES ? 'API de datos históricos' : 'Historical data API',
              isES ? 'Soporte prioritario' : 'Priority support',
              isES ? 'Factura oficial' : 'Official invoice',
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 font-crimson text-[0.95rem] text-mist">
                <Check /> {text}
              </li>
            ))}
          </ul>
          <a
            href="mailto:hola@bellummundi.com"
            className="block w-full py-4 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-bold text-gold border border-gold/40 hover:bg-gold/10 transition-colors text-center"
          >
            {isES ? 'Contactar ventas →' : 'Contact sales →'}
          </a>
        </div>
      </div>
    </section>
  )
}
