'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — FOOTER
// ═══════════════════════════════════════════════════════════

import Link from 'next/link'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'

interface FooterProps {
  lang: Lang
}

const EXPLORE_LINKS = [
  { label: { es: 'Antigüedad', en: 'Antiquity' },       era: 'ancient' },
  { label: { es: 'Edad Media', en: 'Middle Ages' },      era: 'medieval' },
  { label: { es: 'II Guerra Mundial', en: 'World War II' }, era: 'ww2' },
  { label: { es: 'Contemporáneo', en: 'Contemporary' },  era: 'contemporary' },
]

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="border-t border-gold/15 pt-16 pb-8 px-8">
      <div className="max-w-content mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="font-cinzel text-gold font-black text-xl tracking-[0.2em] mb-3">
              ⚔ BELLUM MUNDI
            </div>
            <p className="font-crimson italic text-smoke text-sm leading-relaxed">
              {lang === 'en'
                ? 'The most complete military encyclopedia. From Qadesh to Ukraine, covering all battles, armies and strategists in human history.'
                : 'La enciclopedia militar más completa en español. De Qadesh a Ucrania, pasando por todas las batallas, ejércitos y estrategas de la historia humana.'
              }
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-5">
              {lang === 'en' ? 'Explore' : 'Explorar'}
            </div>
            <ul className="space-y-2">
              {EXPLORE_LINKS.map(link => (
                <li key={link.era}>
                  <Link
                    href={`/${lang}#era-${link.era}`}
                    className="font-crimson text-smoke text-sm hover:text-gold transition-colors"
                  >
                    {lang === 'en' ? link.label.en : link.label.es}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-5">
              {lang === 'en' ? 'Product' : 'Producto'}
            </div>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}#pricing`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  {lang === 'en' ? 'Pricing' : 'Precios'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#auth`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  {lang === 'en' ? 'Create account' : 'Crear cuenta'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#newsletter`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <span
                  className="font-crimson text-smoke text-sm hover:text-gold transition-colors cursor-pointer"
                  onClick={() => alert('API — próximamente / coming soon')}
                >
                  API
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-gold uppercase mb-5">
              Legal
            </div>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}/privacidad`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  {lang === 'en' ? 'Privacy' : 'Privacidad'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terminos`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  {lang === 'en' ? 'Terms' : 'Términos'}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/cookies`} className="font-crimson text-smoke text-sm hover:text-gold transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hola@bellummundi.com"
                  className="font-crimson text-smoke text-sm hover:text-gold transition-colors"
                >
                  {lang === 'en' ? 'Contact' : 'Contacto'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gold/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke uppercase">
            © 2025 Bellum Mundi ·{' '}
            {lang === 'en' ? 'All rights reserved' : 'Todos los derechos reservados'}
          </div>
          <div className="flex gap-6">
            {[
              { label: lang === 'en' ? 'Privacy Policy' : 'Política de Privacidad', href: `/${lang}/privacidad` },
              { label: lang === 'en' ? 'Terms of Use' : 'Términos de Uso', href: `/${lang}/terminos` },
              { label: lang === 'en' ? 'Affiliates' : 'Afiliados', href: `/${lang}/afiliados` },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="font-cinzel text-[0.55rem] tracking-[0.15em] text-smoke uppercase hover:text-gold transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
