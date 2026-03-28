// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NEXT.JS MIDDLEWARE
// Security headers · Redirects · Edge rate limiting
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

// ── In-memory rate limit store (per Edge isolate) ───────────
// For multi-instance production, replace with Upstash Redis.
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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

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

  const res = NextResponse.next()
  return applySecurityHeaders(res)
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf)).*)',
  ],
}
