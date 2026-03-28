// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — NEWSLETTER SUBSCRIBE API
// POST /api/newsletter — inserts email into Supabase
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// In-memory IP rate limiter — 1 subscription per IP per hour
const nlRateStore = new Map<string, number>()

function isNlRateLimited(ip: string): boolean {
  const now = Date.now()
  const last = nlRateStore.get(ip) ?? 0
  if (now - last < 60 * 60 * 1000) return true
  nlRateStore.set(ip, now)
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    if (isNlRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const email: unknown = body?.email

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 320) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim() })

    // Ignore duplicate key — user already subscribed, treat as success
    if (error && !error.message.toLowerCase().includes('duplicate') && error.code !== '23505') {
      console.error('Newsletter insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('Newsletter route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
