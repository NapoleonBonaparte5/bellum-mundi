'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NAVIGATION BAR
// Full nav with mobile hamburger, lang switcher, auth
// + Floating Chat FAB (1B) + Streak badge (8B)
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n'
import { supabase } from '@/lib/supabase/client'
import type { BellumUser } from '@/lib/data/types'
import { getStreak, getSavedCount } from '@/lib/utils/collection'

// Lazy load ChatInterface only when FAB drawer is opened
const ChatInterface = dynamic(
  () => import('@/components/chat/ChatInterface').then(m => m.ChatInterface),
  { ssr: false }
)

interface NavBarProps {
  lang: Lang
}

const NAV_LINKS = (lang: Lang) => [
  { key: 'home',          label: t(lang, 'nav.eras'),        href: `/${lang}#timeline` },
  { key: 'battles',       label: t(lang, 'nav.battles'),     href: `/${lang}/batallas` },
  { key: 'commanders',    label: t(lang, 'nav.commanders'),  href: `/${lang}/comandantes` },
  { key: 'worldmap',      label: t(lang, 'nav.worldmap'),    href: `/${lang}/mapa` },
  { key: 'chat',          label: t(lang, 'nav.chat'),        href: `/${lang}/chat` },
  { key: 'educacion',     label: t(lang, 'nav.educacion'),   href: `/${lang}/educacion` },
  { key: 'timeline',      label: t(lang, 'nav.timeline'),    href: `/${lang}/timeline` },
  { key: 'weapons',       label: t(lang, 'nav.weapons'),     href: `/${lang}/armamento` },
  { key: 'museo',         label: t(lang, 'nav.museo'),       href: `/${lang}/museo` },
  { key: 'library',       label: t(lang, 'nav.library'),     href: `/${lang}/biblioteca` },
  { key: 'civilizations', label: t(lang, 'nav.civs'),        href: `/${lang}/civilizaciones` },
  { key: 'premium',       label: t(lang, 'nav.premium'),     href: `/${lang}#pricing` },
  { key: 'newsletter',    label: t(lang, 'nav.newsletter'),  href: `/${lang}#newsletter` },
]

export function NavBar({ lang }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<BellumUser | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [streak, setStreak] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  const isOnChatPage = pathname.includes('/chat')

  // Load user + gamification data on mount
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
    // Gamification: streak + saved count (client-only)
    setStreak(getStreak())
    setSavedCount(getSavedCount())
  }, [])

  // Close chat drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setChatOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const switchLang = () => {
    const newLang: Lang = lang === 'es' ? 'en' : 'es'
    // Replace current lang segment in URL
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  const links = NAV_LINKS(lang)

  const isActive = (href: string) => {
    if (href.includes('#')) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
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
        <ul className="hidden lg:flex list-none flex-1 justify-center" role="list">
          {links.map((link, i) => (
            <li key={link.key} className="flex items-center">
              {i > 0 && <span className="w-px h-3 bg-gold/15 flex-shrink-0" aria-hidden="true" />}
              <Link
                href={link.href}
                className={`font-cinzel text-[0.6rem] tracking-[0.2em] transition-colors px-3 py-2 uppercase block relative ${
                  isActive(link.href) ? 'text-gold nav-link-active' : 'text-mist hover:text-gold nav-link'
                }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
                <span className="nav-underline" />
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
              {/* Streak badge (8B) — visible when streak >= 2 */}
              {streak >= 2 && (
                <span
                  className="hidden md:inline font-cinzel text-[0.5rem] tracking-wider px-2 py-0.5 font-bold"
                  style={{ background: 'rgba(255,90,0,0.15)', border: '1px solid rgba(255,90,0,0.3)', color: '#FF7A3D' }}
                  title={lang === 'en' ? `${streak}-day streak!` : `¡Racha de ${streak} días!`}
                >
                  🔥 {streak}
                </span>
              )}
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
            className="flex items-center gap-1.5 font-cinzel text-[0.55rem] tracking-[0.18em] text-smoke hover:text-gold transition-all px-2.5 py-1.5 border border-gold/15 hover:border-gold/40 hover:bg-gold/5 uppercase"
            aria-label={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
          >
            <span className="text-sm leading-none">{lang === 'en' ? '🇬🇧' : '🇪🇸'}</span>
            <span className="font-bold">{lang === 'en' ? 'EN' : 'ES'}</span>
            <span className="text-[0.55rem] leading-none opacity-50">→</span>
            <span className="opacity-60">{lang === 'en' ? 'ES' : 'EN'}</span>
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

      {/* Mobile menu — CSS transition for smooth open/close */}
      <div
        id="mobile-menu"
        className="lg:hidden bg-slate border-t border-gold/10 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: menuOpen ? '600px' : '0', opacity: menuOpen ? 1 : 0 }}
        role="menu"
        aria-hidden={!menuOpen}
      >
        <ul className="list-none py-2" role="list">
          {links.map(link => (
            <li key={link.key} role="none">
              <Link
                href={link.href}
                className={`block font-cinzel text-[0.65rem] tracking-[0.2em] hover:bg-gold/5 transition-colors px-6 py-3 uppercase border-b border-gold/5 last:border-0 flex items-center justify-between ${
                  isActive(link.href) ? 'text-gold' : 'text-mist hover:text-gold'
                }`}
                onClick={() => setMenuOpen(false)}
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
              >
                {link.label}
                {isActive(link.href) && <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />}
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
    </nav>
    {/* ── Floating Chat FAB (1B) — hidden on /chat page ── */}
    {!isOnChatPage && (
      <>
        {/* Overlay */}
        <div
          className={`chat-fab-overlay ${chatOpen ? 'open' : ''}`}
          onClick={() => setChatOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          ref={drawerRef}
          className={`chat-fab-drawer ${chatOpen ? 'open' : ''}`}
          role="dialog"
          aria-label={lang === 'en' ? 'AI Military History Chat' : 'Chat de Historia Militar con IA'}
          aria-modal="true"
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-slate flex-shrink-0">
            <span className="font-cinzel text-gold text-[0.65rem] tracking-[0.2em] uppercase">
              {lang === 'en' ? '⚔ AI History Chat' : '⚔ Chat Historia IA'}
            </span>
            <button
              onClick={() => setChatOpen(false)}
              className="text-smoke hover:text-gold transition-colors text-xl leading-none"
              aria-label={lang === 'en' ? 'Close chat' : 'Cerrar chat'}
            >
              ×
            </button>
          </div>
          {/* Embedded ChatInterface in compact mode */}
          <div className="flex-1 overflow-hidden">
            {chatOpen && <ChatInterface lang={lang} compact={true} />}
          </div>
        </div>

        {/* FAB button */}
        <button
          className="chat-fab"
          onClick={() => setChatOpen(o => !o)}
          aria-label={lang === 'en' ? 'Open AI chat' : 'Abrir chat IA'}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 900,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--crimson)',
            border: '2px solid rgba(201,168,76,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 20px rgba(139,26,26,0.5), 0 0 0 0 rgba(139,26,26,0)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {chatOpen ? '×' : '💬'}
        </button>
      </>
    )}
  </>
  )
}
