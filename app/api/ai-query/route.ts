// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI QUERY API ROUTE
// POST /api/ai-query
// Server-side Claude API call — key never exposed to browser
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Rate limiting store (in-memory for now — use Upstash Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const FREE_LIMIT = 3
const PREMIUM_LIMIT = Infinity
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: FREE_LIMIT - 1 }
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: FREE_LIMIT - entry.count }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, isPremium } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Rate limit for free users
    if (!isPremium) {
      const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
      const { allowed } = getRateLimit(ip)
      if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    // Truncate prompt to safe length
    const safePrompt = prompt.slice(0, 4000)

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: safePrompt,
        },
      ],
      system: `You are Bellum Mundi's military historian AI. You provide detailed, accurate, engaging historical analysis in a scholarly but accessible style. Format your responses with HTML: use <h3> for section titles, <p> for paragraphs, <table> for comparisons. Always include Amazon affiliate book recommendations at the end using links with tag=bellummundi-21. Keep responses between 800-1500 words. Be factual, cite real historians when possible.`,
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    // Extract image search terms from the response
    const imageTerms = extractImageTerms(safePrompt)

    return NextResponse.json({
      content: content.text,
      imageTerms,
    })
  } catch (error) {
    console.error('AI query error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}

function extractImageTerms(prompt: string): string[] {
  // Extract battle/person names from prompt for image search
  const terms: string[] = []

  const battleMatch = prompt.match(/batalla de ([^(,\n]+)/i)
  if (battleMatch) terms.push(battleMatch[1].trim() + ' battle historical')

  const personMatch = prompt.match(/vida militar de ([^,\n]+)/i)
  if (personMatch) terms.push(personMatch[1].trim() + ' portrait historical')

  return terms.slice(0, 2)
}
