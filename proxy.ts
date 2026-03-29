// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NEXT.JS PROXY (middleware for Next.js 16+)
// Security headers · Redirects · Edge rate limiting · Auth
// ═══════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// ── Protected routes (require active Supabase session) ──────
const PROTECTED_PATTERN = /^\/(es|en)\/(chat|coleccion)(\/|$|\?)/

// ── In-memory rate limit store (per Edge isolate) ───────────
// NOTE: Each serverless/edge cold start creates a new isolate and resets
// this Map. This is acceptable for the default limit (60 req/min).
// For stricter production enforcement, replace with Upstash Redis.
const store = new Map<string, { count: number; resetAt: number }>()

const LIMITS = {
  '/api/ai-query': { max: 20, window: 60_000 },
  default:         { max: 60, window: 60_000 },
}

function checkRate(ip: string, path: string): boolean {
  const cfg = path.startsWith('/api/ai-query') ? LIMITS['/api/ai-query'] : LIMITS.default
  const key  = `${ip}:${path.startsWith('/api/ai-query') ? 'ai' : 'api'}`
  const now  = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + cfg.window })
    return true
  }
  if (entry.count >= cfg.max) return false
  entry.count++
  return true
}

// ── Security headers applied to every response ──────────────
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  )
  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  let response = NextResponse.next({ request: req })

  // ── Auth: protected routes require an active session ────
  // Only /[lang]/chat and /[lang]/coleccion are gated.
  // All other routes are public; API access is gated in route handlers.
  if (PROTECTED_PATTERN.test(pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value)
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
            })
          },
        },
      }
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const lang = pathname.match(/^\/(es|en)/)?.[1] ?? 'es'
      return NextResponse.redirect(new URL(`/${lang}#pricing`, req.url))
    }
    return applySecurityHeaders(response)
  }

  // ── Redirects ────────────────────────────────────────────
  // Legacy bare routes → localised
  if (pathname === '/batallas' || pathname === '/batallas/') {
    return NextResponse.redirect(new URL('/es/batallas', req.url), 301)
  }
  if (pathname === '/comandantes' || pathname === '/comandantes/') {
    return NextResponse.redirect(new URL('/es/comandantes', req.url), 301)
  }
  if (pathname === '/civilizaciones' || pathname === '/civilizaciones/') {
    return NextResponse.redirect(new URL('/es/civilizaciones', req.url), 301)
  }
  if (pathname === '/biblioteca' || pathname === '/biblioteca/') {
    return NextResponse.redirect(new URL('/es/biblioteca', req.url), 301)
  }
  // Root → /es
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', req.url), 301)
  }

  // ── API rate limiting ────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const allowed = checkRate(ip, pathname)
    if (!allowed) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 }),
      )
    }
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf)).*)',
  ],
}
