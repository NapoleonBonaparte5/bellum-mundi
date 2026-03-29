// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI MILITARY HISTORY CHAT API
// POST /api/chat — streaming, bilingual, tutor mode
// ═══════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// Premium users: in-memory 40 req/min. NOTE: In Vercel serverless each cold start
// creates a new instance and resets this Map. This is acceptable for premium users
// (generous limit). Free users use Supabase-persisted daily limits instead.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 40
const RATE_LIMIT_WINDOW = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// Server-side premium validation via Supabase service role
async function checkPremium(token: string | null): Promise<boolean> {
  if (!token) return false
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data: { user } } = await admin.auth.getUser(token)
    if (!user) return false
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()
    return (
      profile?.plan === 'premium' ||
      profile?.plan === 'educator' ||
      profile?.plan === 'institutional'
    )
  } catch {
    return false
  }
}

// Free users: 5 chat messages/day persisted in Supabase (keyed by 'chat:' + ip)
async function checkFreeDaily(ip: string): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const today = new Date().toISOString().slice(0, 10)
    const key = `chat:${ip}`
    const { data } = await admin
      .from('ai_query_usage')
      .select('count')
      .eq('ip', key)
      .eq('date', today)
      .single()
    const current = (data?.count as number) ?? 0
    if (current >= 5) return false
    await admin
      .from('ai_query_usage')
      .upsert({ ip: key, date: today, count: current + 1 }, { onConflict: 'ip,date' })
    return true
  } catch (err) {
    console.warn('[chat] Supabase usage check failed, failing open', err)
    return true
  }
}

// ── System prompts ───────────────────────────────────────────

const SYSTEM_ES = `Eres el asistente de historia militar de Bellum Mundi — erudito, apasionado y accesible.
Respondes EXCLUSIVAMENTE sobre historia militar: batallas, estrategias, ejércitos, comandantes,
armas, guerras, tratados de paz, tácticas y geopolítica histórica.

Si el usuario pregunta algo fuera de historia militar, responde amablemente:
"Solo puedo ayudarte con historia militar. ¿Tienes alguna pregunta sobre batallas, comandantes o estrategia?"

FORMATO: Usa markdown estructurado. Secciones con ##, sublistas con -, negrita con **.
Respuestas detalladas pero concisas (300-800 palabras según la complejidad).
Cita fechas, números de tropas y fuentes cuando los conozcas con certeza.`

const SYSTEM_ES_TUTOR = `Eres el tutor de historia militar de Bellum Mundi. Tu misión es enseñar, no solo informar.

MODO TUTOR ACTIVO:
- Explica siempre el CONTEXTO antes de los hechos
- Usa analogías modernas para conceptos difíciles
- Termina cada respuesta con 2-3 preguntas de reflexión para el estudiante
- Adapta el nivel de vocabulario si el usuario parece principiante
- Relaciona los eventos con sus causas económicas, sociales y políticas

Solo tratas temas de historia militar. Si preguntan otra cosa, redirige amablemente.`

const SYSTEM_EN = `You are the military history assistant of Bellum Mundi — scholarly, passionate and accessible.
You ONLY answer questions about military history: battles, strategies, armies, commanders,
weapons, wars, peace treaties, tactics and historical geopolitics.

If asked about anything outside military history, reply politely:
"I can only help with military history. Do you have a question about battles, commanders or strategy?"

FORMAT: Use structured markdown. Sections with ##, sublists with -, bold with **.
Detailed but concise answers (300-800 words depending on complexity).
Cite dates, troop numbers and sources when known with certainty.`

const SYSTEM_EN_TUTOR = `You are the military history tutor of Bellum Mundi. Your mission is to teach, not just inform.

TUTOR MODE ACTIVE:
- Always explain CONTEXT before facts
- Use modern analogies for difficult concepts
- End each response with 2-3 reflection questions for the student
- Adapt vocabulary level if the user seems to be a beginner
- Connect events to their economic, social and political causes

You only cover military history topics. If asked about something else, redirect politely.`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  // Server-side premium validation
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') ?? null
  const isPremium = await checkPremium(token)

  if (isPremium) {
    // Premium: 40 req/min in-memory
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } else {
    // Free: 5 messages/day via Supabase
    const allowed = await checkFreeDaily(ip)
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Daily limit reached' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  let body: { messages: { role: string; content: string }[]; lang?: string; tutorMode?: boolean }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { messages, lang = 'es', tutorMode = false } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
  }

  // Validate message structure
  const validMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 4000) }))

  if (validMessages.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid messages' }), { status: 400 })
  }

  const systemPrompt =
    lang === 'en'
      ? tutorMode ? SYSTEM_EN_TUTOR : SYSTEM_EN
      : tutorMode ? SYSTEM_ES_TUTOR : SYSTEM_ES

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: validMessages,
        })
        for await (const event of s) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(new TextEncoder().encode(`\n\n[Error: ${msg}]`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
