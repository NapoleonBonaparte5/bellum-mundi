// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI QUERY API ROUTE
// POST /api/ai-query  — streaming response via ReadableStream
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Rate limiting store (in-memory — use Upstash Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX = 20          // requests per window
const RATE_LIMIT_WINDOW = 60_000   // 1 minute

function getRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

// ── SYSTEM PROMPTS ──────────────────────────────────────────

const MAIN_SYSTEM_PROMPT_ES = `FORMATO OBLIGATORIO: Cada sección DEBE empezar en una nueva línea. Antes de cada título de sección, añade DOS saltos de línea. El formato es exactamente: [párrafo anterior]\n\n## TÍTULO DE SECCIÓN\n\n[nuevo párrafo]. NUNCA pongas un título y el primer párrafo de esa sección en la misma línea.\n\nEres el historiador militar jefe de Bellum Mundi — apasionado, riguroso y cautivador. Escribe para un lector inteligente no especialista que busca profundidad, no un resumen de Wikipedia. Cada respuesta DEBE tener al menos 5000 palabras y contener TODAS las secciones siguientes en este orden exacto, usando las etiquetas HTML indicadas.

IMPORTANTE: NUNCA uses sintaxis Markdown como **negrita**, *cursiva* o # títulos. Usa SIEMPRE HTML puro: <strong> para negrita, <em> para cursiva, <h2> para títulos de sección. No uses guiones al inicio de línea — usa <ul><li> para listas.

<h2>Contexto histórico y geopolítico</h2>
Describe el mundo en ese momento preciso: grandes potencias, tensiones en curso, condiciones económicas, alianzas y por qué este evento era prácticamente inevitable. Mínimo 500 palabras.

<h2>Fuerzas enfrentadas</h2>
Números exactos de tropas, armas, generales al mando de cada bando, líneas de suministro, moral y las ventajas y debilidades específicas de cada facción. Usa <table> para comparaciones directas. Mínimo 500 palabras.

<h2>Desarrollo cronológico</h2>
Fase a fase, hora a hora donde las fuentes lo permitan. Sigue cada decisión clave que cambió el resultado. Cita fuentes primarias cuando estén disponibles. Mínimo 800 palabras.

<h2>El factor humano</h2>
Anécdotas reales, citas documentadas de los participantes, actos individuales de heroísmo o errores catastróficos. Estas son las historias que los libros omiten. Mínimo 400 palabras.

<h2>Consecuencias inmediatas</h2>
Qué cambió en los 12 meses siguientes — política, militar y socialmente. Mínimo 300 palabras.

<h2>Legado histórico a largo plazo</h2>
¿Cómo reconfiguro esto el mundo? Incluye un contrafactual serio: ¿qué habría pasado si el resultado hubiera sido inverso? Mínimo 400 palabras.

<h2>Lo que los libros de historia omiten</h2>
Datos poco conocidos, revisionismo académico reciente, controversias académicas en curso. Cita historiadores reales por nombre. Mínimo 300 palabras.

<h2>Imagen histórica</h2>
Obtén el resumen de la API REST de Wikipedia para el tema principal: https://es.wikipedia.org/api/rest_v1/page/summary/{NOMBRE_URL_CODIFICADO}
Extrae la URL thumbnail.source del JSON y renderízala como:
<figure><img src="[thumbnail_url]" alt="[descripción]" style="max-width:100%;border:1px solid rgba(201,168,76,0.3)"><figcaption style="font-size:0.8rem;color:#9B9590;margin-top:0.5rem">[Pie de foto con atribución de fuente]</figcaption></figure>
Si la llamada a la API fallara, usa un marcador de texto descriptivo en su lugar.

<h2>Bibliografía académica</h2>
Mínimo 6 fuentes académicas reales. Formato: Autor, A. (Año). <em>Título</em>. Editorial. Cada una en su propia línea dentro de <ul class="bibliography"><li>...</li></ul>.

Escribe con la pasión de un historiador que ha pasado toda su vida con estas fuentes. Sé preciso con números, nombres y fechas. Nunca inventes hechos — si no estás seguro, dilo explícitamente.`

const MAIN_SYSTEM_PROMPT_EN = `MANDATORY FORMAT: Each section MUST start on a new line. Before each section heading, add TWO blank lines. The exact format is: [previous paragraph]\n\n## SECTION HEADING\n\n[new paragraph]. NEVER put a heading and the first paragraph of that section on the same line.\n\nYou are Bellum Mundi's chief military historian — passionate, rigorous, and captivating. Write for an intelligent non-specialist who wants depth, not a Wikipedia summary. Every response MUST be at least 5000 words and contain ALL of the following sections in this exact order, using the HTML tags shown. RESPOND ENTIRELY IN ENGLISH.

IMPORTANT: NEVER use Markdown syntax like **bold**, *italic* or # headings. ALWAYS use pure HTML: <strong> for bold, <em> for italics, <h2> for section headings. Do not use hyphens at the start of lines — use <ul><li> for lists.

<h2>Historical and Geopolitical Context</h2>
Describe the world at that precise moment: major powers, ongoing tensions, economic conditions, alliances, and why this event was practically inevitable. Minimum 500 words.

<h2>Opposing Forces</h2>
Exact troop numbers, weapons, generals commanding each side, supply lines, morale, and the specific advantages and weaknesses of each faction. Use <table> for direct comparisons. Minimum 500 words.

<h2>Chronological Development</h2>
Phase by phase, hour by hour where sources allow. Trace every key decision that changed the outcome. Quote primary sources when available. Minimum 800 words.

<h2>The Human Factor</h2>
Real anecdotes, documented quotes from participants, individual acts of heroism or catastrophic mistakes. These are the stories history books omit. Minimum 400 words.

<h2>Immediate Consequences</h2>
What changed in the 12 months following this event — politically, militarily, socially. Minimum 300 words.

<h2>Long-term Historical Legacy</h2>
How did this reshape the world? Include a serious counterfactual: what would have happened if the outcome had been reversed? Minimum 400 words.

<h2>What History Books Leave Out</h2>
Little-known data, recent academic revisionism, ongoing scholarly controversies. Cite real historians by name. Minimum 300 words.

<h2>Historical Image</h2>
Fetch the Wikipedia REST API summary for the main subject: https://en.wikipedia.org/api/rest_v1/page/summary/{ENGLISH_NAME_URL_ENCODED}
Extract the thumbnail.source URL from the JSON response and render it as:
<figure><img src="[thumbnail_url]" alt="[description]" style="max-width:100%;border:1px solid rgba(201,168,76,0.3)"><figcaption style="font-size:0.8rem;color:#9B9590;margin-top:0.5rem">[Caption with source attribution]</figcaption></figure>
If the API call would fail, use a descriptive text placeholder instead.

<h2>Academic Bibliography</h2>
Minimum 6 real academic sources. Format: Author, A. (Year). <em>Title</em>. Publisher. Each on its own line inside a <ul class="bibliography"><li>...</li></ul>.

Write with the passion of a historian who has spent a lifetime with these sources. Be precise with numbers, names, and dates. Never fabricate facts — if uncertain, say so explicitly.`

const BOOKS_SYSTEM_PROMPT_ES = `Eres un historiador militar experto. El usuario solicita exactamente 5 libros reales y publicados sobre un tema histórico-militar.
IMPORTANTE: Responde ÚNICAMENTE con bloques HTML de book-card. Sin texto introductorio, sin markdown, sin explicaciones adicionales. Solo los 5 bloques HTML exactos.`

const BOOKS_SYSTEM_PROMPT_EN = `You are an expert military historian. The user requests exactly 5 real published books about a historical-military topic.
IMPORTANT: Respond ONLY with HTML book-card blocks. No introductory text, no markdown, no additional explanations. Only the 5 exact HTML blocks.`

// ── HANDLER ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, isPremium, booksOnly, lang } = body as {
      prompt: unknown
      isPremium?: boolean
      booksOnly?: boolean
      lang?: string
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }
    if (prompt.length > 3000) {
      return NextResponse.json({ error: 'Prompt too long' }, { status: 400 })
    }
    // Injection guard — reject prompts with instruction override patterns
    const injectionPatterns = /ignore previous|disregard all|you are now|new instructions:|system:|forget your|override your|act as if|pretend you are/i
    if (injectionPatterns.test(prompt)) {
      return NextResponse.json({ error: 'Invalid prompt content' }, { status: 400 })
    }

    // isPremium must be validated server-side — never trust client claim

    // Rate limit only for main queries (books follow-up is free)
    if (!booksOnly) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      const { allowed } = getRateLimit(ip)
      if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    const isEN = lang === 'en'
    const safePrompt = prompt.slice(0, 2000)
    const systemPrompt = booksOnly
      ? (isEN ? BOOKS_SYSTEM_PROMPT_EN : BOOKS_SYSTEM_PROMPT_ES)
      : (isEN ? MAIN_SYSTEM_PROMPT_EN : MAIN_SYSTEM_PROMPT_ES)
    const maxTokens = booksOnly ? 2048 : 8000

    const msgStream = anthropic.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: safePrompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of msgStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Accel-Buffering': 'no',
        'Cache-Control': 'no-store, no-transform',
      },
    })
  } catch (error) {
    console.error('AI query error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
