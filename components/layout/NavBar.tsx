'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NAVIGATION BAR
// Full nav with mobile hamburger, lang switcher, auth
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'
import { supabase } from '@/lib/supabase/client'
import type { BellumUser } from '@/lib/data/types'

interface NavBarProps {
  lang: Lang
}

const NAV_LINKS = (lang: Lang) => [
  { key: 'home',          label: t(lang, 'nav_eras'),        href: `/${lang}#timeline` },
  { key: 'battles',       label: t(lang, 'nav_battles'),     href: `/${lang}/batallas` },
  { key: 'commanders',    label: t(lang, 'nav_commanders'),  href: `/${lang}/comandantes` },
  { key: 'worldmap',      label: t(lang, 'nav_worldmap'),    href: `/${lang}/mapa` },
  { key: 'library',       label: t(lang, 'nav_library'),     href: `/${lang}/biblioteca` },
  { key: 'civilizations', label: t(lang, 'nav_civs'),        href: `/${lang}/civilizaciones` },
  { key: 'premium',       label: t(lang, 'nav_premium'),     href: `/${lang}#pricing` },
  { key: 'newsletter',    label: t(lang, 'nav_newsletter'),  href: `/${lang}#newsletter` },
]

export function NavBar({ lang }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<BellumUser | null>(null)
  const [isPremium, setIsPremium] = useState(false)

  // Load user on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setUser({ id: session.user.id, name: profile.name, email: session.user.email!, plan: profile.plan })
          setIsPremium(profile.plan === 'premium')
        }
      }
    })
  }, [])

  const switchLang = () => {
    const newLang: Lang = lang === 'es' ? 'en' : 'es'
    // Replace current lang segment in URL
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  const links = NAV_LINKS(lang)

  return (
    <nav
      id="nav"
      className="sticky top-0 z-[500] bg-ink/95 backdrop-blur-xl border-b border-gold/20"
      role="navigation"
      aria-label={lang === 'en' ? 'Main navigation' : 'Navegación principal'}
    >
      <div className="max-w-content mx-auto flex items-center justify-between h-16 px-4 md:px-8 gap-4">

        {/* Logo */}
        <Link
          href={`/${lang}`}
          className="font-cinzel text-gold font-bold tracking-widest text-lg flex-shrink-0 hover:text-gold-light transition-colors"
          aria-label="Bellum Mundi — Inicio"
        >
          ⚔ BELLUM MUNDI
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex gap-6 list-none flex-1 justify-center" role="list">
          {links.map(link => (
            <li key={link.key}>
              <Link
                href={link.href}
                className="font-cinzel text-[0.6rem] tracking-[0.2em] text-mist hover:text-gold transition-colors px-3 py-2 uppercase block"
                aria-current={pathname.includes(link.key) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side: queries + auth + lang */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Queries indicator (non-premium) */}
          {!isPremium && (
            <div className="hidden md:flex items-center gap-1 font-cinzel text-[0.6rem] tracking-[0.1em] text-smoke border border-gold/20 px-2 py-1">
              <span className="text-gold font-bold">3</span>
              <span>{lang === 'en' ? 'queries' : 'consultas'}</span>
            </div>
          )}

          {/* Premium button */}
          {!isPremium && (
            <Link
              href={`/${lang}#pricing`}
              className="hidden md:block bg-gradient-to-r from-gold-dark to-gold text-ink font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-3 py-2 font-bold hover:opacity-90 transition-opacity"
            >
              ⚡ Premium
            </Link>
          )}

          {/* User button or login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 text-gold font-cinzel font-bold flex items-center justify-center hover:bg-gold/25 transition-colors"
                aria-label={`${lang === 'en' ? 'Account' : 'Cuenta'}: ${user.name}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {isPremium && (
                <span className="hidden md:inline bg-gradient-to-r from-gold-dark to-gold text-ink font-cinzel text-[0.5rem] tracking-[0.15em] px-2 py-0.5 font-bold uppercase">
                  PREMIUM
                </span>
              )}
            </div>
          ) : (
            <button className="hidden md:block border border-gold/30 text-mist font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-3 py-2 hover:text-gold hover:border-gold transition-colors">
              {lang === 'en' ? 'Sign In' : 'Entrar'}
            </button>
          )}

          {/* Language switcher */}
          <button
            onClick={switchLang}
            className="flex items-center gap-1 font-cinzel text-[0.55rem] tracking-[0.2em] text-smoke hover:text-gold transition-colors px-2 py-1 border border-transparent hover:border-gold/20"
            aria-label={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
          >
            <span className="text-base leading-none">{lang === 'en' ? '🇬🇧' : '🇪🇸'}</span>
            <span>{lang === 'en' ? 'EN' : 'ES'}</span>
            <svg className="w-2 h-2 opacity-60" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 text-mist hover:text-gold transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen
              ? (lang === 'en' ? 'Close menu' : 'Cerrar menú')
              : (lang === 'en' ? 'Open menu' : 'Abrir menú')
            }
          >
            <span className={`block w-5 h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-slate border-t border-gold/10"
          role="menu"
        >
          <ul className="list-none py-2" role="list">
            {links.map(link => (
              <li key={link.key} role="none">
                <Link
                  href={link.href}
                  className="block font-cinzel text-[0.65rem] tracking-[0.2em] text-mist hover:text-gold hover:bg-gold/5 transition-colors px-6 py-3 uppercase"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile auth row */}
          <div className="px-6 pb-4 flex gap-3 border-t border-gold/10 pt-3">
            {!user && (
              <button className="flex-1 border border-gold/30 text-mist font-cinzel text-[0.6rem] tracking-[0.15em] uppercase py-2 hover:text-gold hover:border-gold transition-colors">
                {lang === 'en' ? 'Sign In' : 'Entrar'}
              </button>
            )}
            {!isPremium && (
              <Link
                href={`/${lang}#pricing`}
                className="flex-1 bg-gradient-to-r from-gold-dark to-gold text-ink font-cinzel text-[0.6rem] tracking-[0.15em] uppercase py-2 text-center font-bold"
                onClick={() => setMenuOpen(false)}
              >
                ⚡ Premium
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
