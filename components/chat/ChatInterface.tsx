'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI MILITARY HISTORY CHAT INTERFACE
// Streaming chat, tutor mode, 5 free messages, Supabase save
// ═══════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Lang } from '@/lib/data/types'
import { processContent } from '@/lib/utils/processContent'
import { supabase } from '@/lib/supabase/client'

interface ChatInterfaceProps {
  lang: Lang
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  html?: string
}

const FREE_LIMIT = 5
const LS_KEY = 'bm_chat_used'

// ── Suggestions ─────────────────────────────────────────────
const SUGGESTIONS_ES = [
  '¿Cuáles fueron las causas de la caída del Imperio Romano?',
  'Explica la táctica de la falange macedónica de Alejandro Magno',
  'Compara las estrategias de Napoleón y Wellington en Waterloo',
  '¿Por qué perdió Alemania la Segunda Guerra Mundial?',
  'Explica la revolución en los asuntos militares del siglo XX',
  '¿Cuál fue el papel de la caballería en la Edad Media?',
]

const SUGGESTIONS_EN = [
  'What were the causes of the fall of the Roman Empire?',
  'Explain Alexander the Great\'s Macedonian phalanx tactic',
  'Compare Napoleon\'s and Wellington\'s strategies at Waterloo',
  'Why did Germany lose World War II?',
  'Explain the revolution in military affairs of the 20th century',
  'What was the role of cavalry in the Middle Ages?',
]

// ── UI strings ───────────────────────────────────────────────
const UI = {
  es: {
    title: 'Asistente de Historia Militar',
    subtitle: 'Pregunta sobre batallas, comandantes, estrategias, guerras y tratados',
    placeholder: 'Escribe tu pregunta de historia militar...',
    send: 'Enviar',
    tutorMode: 'Modo Tutor',
    tutorOn: 'Tutor activo',
    thinking: 'Consultando los archivos históricos...',
    freeLeft: (n: number) => `${n} de ${FREE_LIMIT} consultas gratuitas restantes`,
    limitTitle: 'Límite de consultas gratuitas alcanzado',
    limitDesc: 'Obtén consultas ilimitadas con Premium',
    limitCta: 'Ver Premium →',
    clearBtn: 'Nueva conversación',
    suggestTitle: '¿Por dónde empezar?',
  },
  en: {
    title: 'Military History Assistant',
    subtitle: 'Ask about battles, commanders, strategies, wars and treaties',
    placeholder: 'Type your military history question...',
    send: 'Send',
    tutorMode: 'Tutor Mode',
    tutorOn: 'Tutor active',
    thinking: 'Consulting the historical archives...',
    freeLeft: (n: number) => `${n} of ${FREE_LIMIT} free queries remaining`,
    limitTitle: 'Free query limit reached',
    limitDesc: 'Get unlimited queries with Premium',
    limitCta: 'See Premium →',
    clearBtn: 'New conversation',
    suggestTitle: 'Where to start?',
  },
}

export function ChatInterface({ lang }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tutorMode, setTutorMode] = useState(false)
  const [usedCount, setUsedCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const ui = UI[lang]
  const suggestions = lang === 'en' ? SUGGESTIONS_EN : SUGGESTIONS_ES

  // Load premium status and usage count
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(LS_KEY) ?? '0', 10)
    setUsedCount(saved)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('plan').eq('id', session.user.id).single()
        if (profile?.plan === 'premium') setIsPremium(true)
      }
    })
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const canSend = isPremium || usedCount < FREE_LIMIT

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || loading || !canSend) return

    const userMsg: Message = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Increment usage for free users
    if (!isPremium) {
      const next = usedCount + 1
      setUsedCount(next)
      localStorage.setItem(LS_KEY, String(next))
    }

    // Placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '', html: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          lang,
          tutorMode,
        }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        const html = processContent(acc)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: acc, html }
          return updated
        })
      }

      // Save to Supabase for premium users
      if (isPremium) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.from('chat_history').insert({
            user_id: session.user.id,
            lang,
            messages: [...newMessages, { role: 'assistant', content: acc }],
            tutor_mode: tutorMode,
          })
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido'
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: errMsg,
          html: `<p class="text-crimson">[Error: ${errMsg}]</p>`,
        }
        return updated
      })
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }, [input, messages, loading, canSend, isPremium, usedCount, lang, tutorMode])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearConversation = () => {
    setMessages([])
    setInput('')
    textareaRef.current?.focus()
  }

  const freeRemaining = Math.max(0, FREE_LIMIT - usedCount)
  const showLimit = !isPremium && usedCount >= FREE_LIMIT

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <div className="border-b border-gold/20 bg-slate/50 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">
              {lang === 'en' ? 'AI Military History' : 'Historia Militar con IA'}
            </p>
            <h1 className="font-cinzel text-gold text-2xl font-bold">{ui.title}</h1>
            <p className="text-smoke text-sm mt-1">{ui.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 pt-1">
            {/* Tutor mode toggle */}
            <button
              onClick={() => setTutorMode(v => !v)}
              className={`flex items-center gap-2 font-cinzel text-[0.65rem] tracking-widest uppercase px-3 py-2 border transition-all ${
                tutorMode
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gold/25 text-smoke hover:border-gold/50 hover:text-mist'
              }`}
              title={tutorMode ? ui.tutorOn : ui.tutorMode}
            >
              <span>📚</span>
              <span className="hidden sm:inline">{tutorMode ? ui.tutorOn : ui.tutorMode}</span>
            </button>
            {/* Clear button — only show if there are messages */}
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="font-cinzel text-[0.65rem] tracking-widest uppercase px-3 py-2 border border-gold/25 text-smoke hover:border-gold/50 hover:text-mist transition-all"
              >
                {ui.clearBtn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Suggestions — shown when no messages */}
          {messages.length === 0 && (
            <div>
              <p className="eyebrow text-center mb-5">{ui.suggestTitle}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    disabled={!canSend}
                    className="text-left p-4 border border-gold/20 bg-slate/30 hover:bg-slate/60 hover:border-gold/40 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="text-smoke text-sm group-hover:text-mist transition-colors leading-relaxed">
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-cinzel font-bold ${
                msg.role === 'user'
                  ? 'bg-gold/15 border border-gold/30 text-gold'
                  : 'bg-crimson/15 border border-crimson/30 text-crimson'
              }`}>
                {msg.role === 'user' ? 'U' : '⚔'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                {msg.role === 'user' ? (
                  <div className="bg-gold/10 border border-gold/20 px-4 py-3 text-mist text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className="ai-content text-mist text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: msg.html || msg.content }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-cinzel font-bold bg-crimson/15 border border-crimson/30 text-crimson">
                ⚔
              </div>
              <div className="flex items-center gap-3 text-smoke text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>{ui.thinking}</span>
              </div>
            </div>
          )}

          {/* Free limit banner */}
          {showLimit && (
            <div className="border border-gold/40 bg-gold/5 p-5 text-center">
              <p className="font-cinzel text-gold text-base font-bold mb-1">{ui.limitTitle}</p>
              <p className="text-smoke text-sm mb-4">{ui.limitDesc}</p>
              <a
                href={`/${lang}#pricing`}
                className="btn-primary inline-block"
              >
                {ui.limitCta}
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gold/20 bg-slate/50 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Free usage indicator */}
          {!isPremium && !showLimit && (
            <p className="text-smoke text-[0.65rem] font-cinzel tracking-wider mb-2 text-right">
              {ui.freeLeft(freeRemaining)}
            </p>
          )}

          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={ui.placeholder}
              disabled={loading || showLimit}
              rows={2}
              className="flex-1 bg-ink border border-gold/25 text-mist placeholder-smoke/50 text-sm px-4 py-3 resize-none focus:outline-none focus:border-gold/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans leading-relaxed"
              style={{ minHeight: '72px', maxHeight: '200px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || showLimit}
              className="btn-primary flex-shrink-0 h-[72px] px-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {ui.send}
            </button>
          </div>
          <p className="text-smoke/40 text-[0.6rem] mt-2 text-center">
            {lang === 'en'
              ? 'Press Enter to send · Shift+Enter for new line'
              : 'Enter para enviar · Shift+Enter para nueva línea'}
          </p>
        </div>
      </div>
    </div>
  )
}
