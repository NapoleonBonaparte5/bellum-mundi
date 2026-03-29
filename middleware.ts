// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — EDGE MIDDLEWARE
// Server-side route protection via @supabase/ssr
// Only /[lang]/chat and /[lang]/coleccion require session.
// All other routes are public (API gating is in route handlers).
// ═══════════════════════════════════════════════════════════

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Only these routes require an active session
const PROTECTED_PATTERN = /^\/(es|en)\/(chat|coleccion)(\/|$|\?)/

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  // Fast pass-through for non-protected routes (no Supabase call needed)
  if (!PROTECTED_PATTERN.test(pathname)) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const lang = pathname.match(/^\/(es|en)/)?.[1] ?? 'es'
    return NextResponse.redirect(new URL(`/${lang}#pricing`, request.url))
  }

  return response
}

export const config = {
  // Exclude static files, Next.js internals, and API routes from middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
