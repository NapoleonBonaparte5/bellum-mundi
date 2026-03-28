'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — EDUCATIONAL LESSON GENERATOR
// AI-powered: lesson plans, quizzes, essays, timelines
// ═══════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from 'react'
import type { Lang, FlatBattle } from '@/lib/data/types'
import { processContent } from '@/lib/utils/processContent'

interface LessonGeneratorProps {
  lang: Lang
  battles: FlatBattle[]
}

type Level = 'beginner' | 'intermediate' | 'advanced'
type Format = 'lesson' | 'quiz' | 'essay' | 'timeline'
type Duration = '30' | '60' | '90'

// ── Static data ──────────────────────────────────────────────
const LEVELS: { id: Level; labelEs: string; labelEn: string; desc: string }[] = [
  { id: 'beginner',     labelEs: 'Principiante',  labelEn: 'Beginner',     desc: '12-14 años / High School' },
  { id: 'intermediate', labelEs: 'Intermedio',    labelEn: 'Intermediate', desc: '15-17 años / Pre-University' },
  { id: 'advanced',     labelEs: 'Avanzado',      labelEn: 'Advanced',     desc: 'Universidad / Experto' },
]

const FORMATS: { id: Format; icon: string; labelEs: string; labelEn: string; descEs: string; descEn: string }[] = [
  {
    id: 'lesson',
    icon: '📋',
    labelEs: 'Plan de Clase',
    labelEn: 'Lesson Plan',
    descEs: 'Objetivos, desarrollo, actividades y evaluación',
    descEn: 'Objectives, development, activities and assessment',
  },
  {
    id: 'quiz',
    icon: '❓',
    labelEs: 'Cuestionario',
    labelEn: 'Quiz',
    descEs: '10 preguntas con respuestas y explicaciones',
    descEn: '10 questions with answers and explanations',
  },
  {
    id: 'essay',
    icon: '✍️',
    labelEs: 'Esquema de Ensayo',
    labelEn: 'Essay Outline',
    descEs: 'Tesis, argumentos, fuentes y conclusión',
    descEn: 'Thesis, arguments, sources and conclusion',
  },
  {
    id: 'timeline',
    icon: '📅',
    labelEs: 'Línea del Tiempo',
    labelEn: 'Timeline',
    descEs: 'Hitos cronológicos comentados con contexto',
    descEn: 'Commented chronological milestones with context',
  },
]

const DURATIONS: { id: Duration; label: string }[] = [
  { id: '30', label: '30 min' },
  { id: '60', label: '60 min' },
  { id: '90', label: '90 min' },
]

// ── Prompt builder ───────────────────────────────────────────
function buildPrompt(
  topic: string,
  level: Level,
  format: Format,
  duration: Duration,
  isES: boolean,
): string {
  const levelMap = {
    beginner:     isES ? 'principiante (12-14 años, secundaria)'       : 'beginner (ages 12-14, middle school)',
    intermediate: isES ? 'intermedio (15-17 años, bachillerato)'        : 'intermediate (ages 15-17, high school)',
    advanced:     isES ? 'avanzado (universitario o experto en historia)': 'advanced (university level or history expert)',
  }
  const levelStr = levelMap[level]
  const durStr = `${duration} ${isES ? 'minutos' : 'minutes'}`

  if (isES) {
    switch (format) {
      case 'lesson':
        return `Eres un pedagogo experto en historia militar. Crea un plan de clase completo y detallado sobre el tema: "${topic}". Nivel: ${levelStr}. Duración: ${durStr}.

El plan debe incluir TODAS estas secciones con el formato markdown indicado:

## Información General
- Tema, nivel, duración, asignatura sugerida

## Objetivos de Aprendizaje
Lista de 4-6 objetivos específicos y medibles

## Conocimientos Previos Requeridos
Qué debe saber el alumno antes de la clase

## Desarrollo de la Clase

### Introducción (15% del tiempo)
Actividad de enganche, pregunta motivadora, contextualización

### Desarrollo Central (60% del tiempo)
Explicación detallada con subtemas, ejemplos y anécdotas históricas concretas. Mínimo 3 actividades interactivas.

### Cierre (25% del tiempo)
Síntesis, debate final, tarea opcional

## Materiales y Recursos
Mapas, documentales, fuentes primarias recomendadas

## Evaluación
Criterios de evaluación y rúbrica simplificada

## Adaptaciones
Para alumnos con necesidades especiales o ritmos distintos`

      case 'quiz':
        return `Eres un profesor de historia militar. Crea un cuestionario completo de 10 preguntas sobre: "${topic}". Nivel: ${levelStr}.

Incluye preguntas de distintos tipos:
- 3 preguntas de opción múltiple (con 4 opciones cada una)
- 3 preguntas de verdadero/falso con justificación
- 2 preguntas de desarrollo corto (2-3 párrafos)
- 2 preguntas de análisis crítico o comparación

Para CADA pregunta incluye:
- La pregunta numerada claramente
- Las opciones (si aplica)
- **Respuesta correcta** en negrita
- Explicación breve de 2-3 frases con contexto histórico

Formato markdown limpio con ## para cada pregunta.`

      case 'essay':
        return `Eres un profesor universitario de historia militar. Crea un esquema de ensayo académico detallado sobre: "${topic}". Nivel: ${levelStr}. Extensión objetivo: ${duration === '30' ? '800-1200' : duration === '60' ? '1500-2500' : '3000-5000'} palabras.

Estructura el esquema con:

## Título Sugerido
Un título académico atractivo

## Tesis Principal
La argumentación central en 2-3 frases

## Introducción
- Gancho inicial, contextualización, presentación de tesis

## Desarrollo (3-5 secciones)
Para cada sección:
- Título de la sección
- Argumento central
- Evidencias históricas específicas (batallas, fechas, protagonistas)
- Posibles contraargumentos a rebatir

## Conclusión
- Síntesis de argumentos, implicaciones y preguntas abiertas

## Fuentes Sugeridas
5-8 referencias académicas reales (libros, artículos, fuentes primarias)

## Palabras Clave
10 términos históricos clave para investigar`

      case 'timeline':
        return `Eres un historiador militar. Crea una línea del tiempo educativa y comentada sobre: "${topic}". Nivel: ${levelStr}.

Incluye entre 12 y 20 hitos cronológicos, organizados así:

Para cada hito usa este formato exacto:
### [AÑO/FECHA] — [NOMBRE DEL EVENTO]
**Qué ocurrió:** Descripción concisa del evento (2-3 frases)
**Por qué importa:** Significado histórico y consecuencias inmediatas (2-3 frases)
**Conexión:** Cómo se relaciona con el evento anterior o siguiente

Al final incluye:
## Grandes Transformaciones
Las 3-5 transformaciones militares más importantes del período

## Para Profundizar
3 preguntas de reflexión para el alumno`
    }
  } else {
    switch (format) {
      case 'lesson':
        return `You are an expert military history educator. Create a complete and detailed lesson plan on the topic: "${topic}". Level: ${levelStr}. Duration: ${durStr}.

The plan must include ALL these sections:

## General Information
- Topic, level, duration, suggested subject

## Learning Objectives
List of 4-6 specific and measurable objectives

## Prior Knowledge Required
What students should know before the class

## Class Development

### Introduction (15% of time)
Hook activity, motivating question, contextualization

### Core Development (60% of time)
Detailed explanation with subtopics, concrete historical examples and anecdotes. Minimum 3 interactive activities.

### Closure (25% of time)
Synthesis, final debate, optional homework

## Materials and Resources
Recommended maps, documentaries, primary sources

## Assessment
Assessment criteria and simplified rubric

## Adaptations
For students with special needs or different learning paces`

      case 'quiz':
        return `You are a military history teacher. Create a complete 10-question quiz on: "${topic}". Level: ${levelStr}.

Include different question types:
- 3 multiple choice questions (with 4 options each)
- 3 true/false questions with justification
- 2 short answer questions (2-3 paragraphs)
- 2 critical analysis or comparison questions

For EACH question include:
- Numbered question clearly stated
- Options (where applicable)
- **Correct answer** in bold
- Brief 2-3 sentence explanation with historical context

Clean markdown format with ## for each question.`

      case 'essay':
        return `You are a university military history professor. Create a detailed academic essay outline on: "${topic}". Level: ${levelStr}. Target length: ${duration === '30' ? '800-1200' : duration === '60' ? '1500-2500' : '3000-5000'} words.

Structure the outline with:

## Suggested Title
An attractive academic title

## Main Thesis
The central argument in 2-3 sentences

## Introduction
- Opening hook, contextualization, thesis presentation

## Body (3-5 sections)
For each section:
- Section title
- Central argument
- Specific historical evidence (battles, dates, key figures)
- Possible counterarguments to address

## Conclusion
- Argument synthesis, implications and open questions

## Suggested Sources
5-8 real academic references (books, articles, primary sources)

## Key Terms
10 key historical terms to research`

      case 'timeline':
        return `You are a military historian. Create an educational annotated timeline on: "${topic}". Level: ${levelStr}.

Include between 12 and 20 chronological milestones, organized as follows:

For each milestone use this exact format:
### [YEAR/DATE] — [EVENT NAME]
**What happened:** Concise description of the event (2-3 sentences)
**Why it matters:** Historical significance and immediate consequences (2-3 sentences)
**Connection:** How it relates to the previous or next event

At the end include:
## Major Transformations
The 3-5 most important military transformations of the period

## For Further Study
3 reflection questions for students`
    }
  }
  return ''
}

// ── Main component ───────────────────────────────────────────
export function LessonGenerator({ lang, battles }: LessonGeneratorProps) {
  const isES = lang === 'es'

  const [topic, setTopic]           = useState('')
  const [level, setLevel]           = useState<Level>('intermediate')
  const [format, setFormat]         = useState<Format>('lesson')
  const [duration, setDuration]     = useState<Duration>('60')
  const [result, setResult]         = useState<string | null>(null)
  const [resultRaw, setResultRaw]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  const suggestions = topic.length >= 2
    ? battles
        .filter(b => b.name.toLowerCase().includes(topic.toLowerCase()))
        .slice(0, 6)
    : []

  const generate = useCallback(async () => {
    if (!topic.trim() || loading) return
    setResult(null)
    setResultRaw('')
    setLoading(true)
    setShowSuggestions(false)

    const prompt = buildPrompt(topic, level, format, duration, isES)

    try {
      const res = await fetch('/api/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, isPremium: false, lang }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setResultRaw(acc)
        setResult(processContent(acc))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error'
      setResult(`<p class="text-crimson">[Error: ${msg}]</p>`)
    }
    setLoading(false)
  }, [topic, level, format, duration, isES, lang, loading])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultRaw).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const downloadTxt = () => {
    const blob = new Blob([resultRaw], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bellummundi-${format}-${topic.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Page header */}
      <div className="border-b border-gold/20 bg-slate/50 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow mb-2">
            {isES ? 'Herramienta Educativa' : 'Educational Tool'}
          </p>
          <h1 className="font-cinzel text-gold text-3xl font-bold mb-2">
            {isES ? 'Generador de Lecciones' : 'Lesson Generator'}
          </h1>
          <p className="text-smoke text-base max-w-xl">
            {isES
              ? 'Genera planes de clase, cuestionarios, esquemas de ensayo y líneas del tiempo sobre cualquier tema de historia militar con IA.'
              : 'Generate lesson plans, quizzes, essay outlines and timelines on any military history topic with AI.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ── LEFT: Config form ── */}
          <div className="space-y-8">

            {/* Step 1: Topic */}
            <div>
              <label className="block font-cinzel text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-3">
                {isES ? '1. Tema de la lección' : '1. Lesson topic'}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={topic}
                  onChange={e => { setTopic(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={isES
                    ? 'Ej: Batalla de Waterloo, Táctica de la falange, Segunda Guerra Mundial...'
                    : 'E.g.: Battle of Waterloo, Phalanx tactic, World War II...'}
                  className="w-full bg-slate border border-gold/25 text-mist placeholder-smoke/40 text-sm px-4 py-3 focus:outline-none focus:border-gold/60 transition-colors font-crimson"
                  onKeyDown={e => { if (e.key === 'Enter') generate() }}
                />
                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full top-full left-0 bg-slate border border-gold/30 border-t-0 shadow-xl">
                    {suggestions.map((b, i) => (
                      <button
                        key={i}
                        onMouseDown={() => { setTopic(b.name); setShowSuggestions(false) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gold/10 transition-colors flex items-center justify-between gap-3 border-b border-gold/10 last:border-0"
                      >
                        <span className="font-crimson text-mist text-sm">{b.name}</span>
                        <span className="font-cinzel text-[0.5rem] tracking-wider text-smoke uppercase flex-shrink-0">{b.year}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Level */}
            <div>
              <label className="block font-cinzel text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-3">
                {isES ? '2. Nivel del alumnado' : '2. Student level'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`p-4 border text-left transition-all ${
                      level === l.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 bg-slate/30 hover:border-gold/40'
                    }`}
                  >
                    <div className="font-cinzel text-[0.6rem] tracking-wider uppercase mb-1 text-mist">
                      {isES ? l.labelEs : l.labelEn}
                    </div>
                    <div className="font-crimson text-smoke text-[0.72rem] leading-tight">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Format */}
            <div>
              <label className="block font-cinzel text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-3">
                {isES ? '3. Formato del material' : '3. Output format'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-4 border text-left transition-all ${
                      format === f.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 bg-slate/30 hover:border-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{f.icon}</span>
                      <span className="font-cinzel text-[0.6rem] tracking-wider uppercase text-mist">
                        {isES ? f.labelEs : f.labelEn}
                      </span>
                    </div>
                    <p className="font-crimson text-smoke text-[0.72rem] leading-tight">
                      {isES ? f.descEs : f.descEn}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Duration */}
            <div>
              <label className="block font-cinzel text-[0.65rem] tracking-[0.25em] text-gold uppercase mb-3">
                {isES ? '4. Duración de la sesión' : '4. Session duration'}
              </label>
              <div className="flex gap-3">
                {DURATIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={`flex-1 py-3 border font-cinzel text-[0.65rem] tracking-wider uppercase transition-all ${
                      duration === d.id
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gold/20 bg-slate/30 text-smoke hover:border-gold/40 hover:text-mist'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={!topic.trim() || loading}
              className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? (isES ? 'Generando lección...' : 'Generating lesson...')
                : (isES ? '⚡ Generar Lección' : '⚡ Generate Lesson')}
            </button>
          </div>

          {/* ── RIGHT: Quick picks ── */}
          <div>
            <p className="font-cinzel text-[0.6rem] tracking-[0.2em] text-smoke uppercase mb-3">
              {isES ? 'Temas populares' : 'Popular topics'}
            </p>
            <div className="flex flex-col gap-2">
              {[
                { es: 'Segunda Guerra Mundial', en: 'World War II' },
                { es: 'Alejandro Magno', en: 'Alexander the Great' },
                { es: 'Batalla de Waterloo', en: 'Battle of Waterloo' },
                { es: 'Imperio Romano', en: 'Roman Empire' },
                { es: 'Guerras Napoleónicas', en: 'Napoleonic Wars' },
                { es: 'Primera Guerra Mundial', en: 'World War I' },
                { es: 'Cruzadas', en: 'The Crusades' },
                { es: 'Guerra Fría', en: 'Cold War' },
                { es: 'Conquista de América', en: 'Conquest of the Americas' },
                { es: 'Guerras Púnicas', en: 'Punic Wars' },
              ].map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setTopic(isES ? t.es : t.en); inputRef.current?.focus() }}
                  className="text-left px-3 py-2 border border-gold/15 bg-slate/20 hover:bg-slate/50 hover:border-gold/35 transition-all group"
                >
                  <span className="font-crimson text-smoke text-sm group-hover:text-mist transition-colors">
                    {isES ? t.es : t.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Result area ── */}
        {(loading || result) && (
          <div className="mt-10">
            {/* Loading dots while streaming starts */}
            {loading && !result && (
              <div className="flex items-center gap-3 text-smoke py-8 justify-center">
                <span className="inline-flex gap-1">
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span className="font-cinzel text-[0.65rem] tracking-widest uppercase">
                  {isES ? 'Generando material educativo...' : 'Generating educational material...'}
                </span>
              </div>
            )}

            {result && (
              <div className="bg-slate border border-gold/20">
                {/* Result header */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gold/15">
                  <div>
                    <span className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke uppercase">
                      {isES ? 'Material generado' : 'Generated material'} · {FORMATS.find(f => f.id === format)?.[isES ? 'labelEs' : 'labelEn']} · {LEVELS.find(l => l.id === level)?.[isES ? 'labelEs' : 'labelEn']} · {duration} min
                    </span>
                    <p className="font-cinzel text-gold text-sm font-bold mt-0.5">{topic}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={copyToClipboard}
                      className="font-cinzel text-[0.55rem] tracking-widest uppercase px-3 py-2 border border-gold/25 text-smoke hover:border-gold/50 hover:text-mist transition-all"
                    >
                      {copied ? (isES ? '✓ Copiado' : '✓ Copied') : (isES ? 'Copiar' : 'Copy')}
                    </button>
                    <button
                      onClick={downloadTxt}
                      className="font-cinzel text-[0.55rem] tracking-widest uppercase px-3 py-2 border border-gold/25 text-smoke hover:border-gold/50 hover:text-mist transition-all"
                    >
                      {isES ? '↓ Descargar' : '↓ Download'}
                    </button>
                    <button
                      onClick={() => { setResult(null); setResultRaw('') }}
                      className="font-cinzel text-[0.55rem] tracking-widest uppercase px-3 py-2 border border-gold/25 text-smoke hover:border-gold/50 hover:text-mist transition-all"
                    >
                      {isES ? 'Nueva' : 'New'}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="ai-content font-crimson text-parchment-dark text-base leading-relaxed p-8 md:p-10"
                  dangerouslySetInnerHTML={{ __html: result }}
                />

                {/* Footer */}
                {!loading && (
                  <div className="border-t border-gold/10 px-6 py-4 flex items-center justify-between">
                    <span className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase">
                      {isES ? '✦ Generado con Claude AI · Bellum Mundi' : '✦ Generated with Claude AI · Bellum Mundi'}
                    </span>
                    <button
                      onClick={generate}
                      className="font-cinzel text-[0.55rem] tracking-widest uppercase text-gold hover:text-gold-light transition-colors border border-gold/30 px-3 py-1.5 hover:border-gold/60"
                    >
                      {isES ? '↺ Regenerar' : '↺ Regenerate'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
