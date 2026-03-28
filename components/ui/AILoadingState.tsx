'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI LOADING STATE
// Rotating quotes typewriter + fake progress bar
// ═══════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react'
import type { Lang } from '@/lib/data/types'

const QUOTES: Record<Lang, string[]> = {
  es: [
    '"La guerra es el padre de todas las cosas." — Heráclito',
    '"El arte de la guerra es de vital importancia para el Estado." — Sun Tzu',
    '"Veni, vidi, vici." — Julio César',
    '"En la guerra no hay victorias, sólo hay grados de devastación." — Einsten',
    '"Conoce a tu enemigo y conócete a ti mismo." — Sun Tzu',
    '"La historia la escriben los vencedores." — proverbio',
    '"El valor es la primera de las cualidades humanas." — Aristóteles',
  ],
  en: [
    '"War is the father of all things." — Heraclitus',
    '"The art of war is of vital importance to the State." — Sun Tzu',
    '"Veni, vidi, vici." — Julius Caesar',
    '"In war, there are no victors, only varying degrees of devastation."',
    '"Know your enemy and know yourself." — Sun Tzu',
    '"History is written by the victors." — proverb',
    '"Courage is the first of human virtues." — Aristotle',
  ],
}

interface AILoadingStateProps {
  lang: Lang
  label?: string
}

export function AILoadingState({ lang, label }: AILoadingStateProps) {
  const quotes = QUOTES[lang]
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * quotes.length))
  const [displayed, setDisplayed] = useState('')
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Rotate quotes every 4s
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIdx(i => (i + 1) % quotes.length)
    }, 4000)
    return () => clearInterval(id)
  }, [quotes.length])

  // Typewriter for current quote
  useEffect(() => {
    const full = quotes[quoteIdx]
    setDisplayed('')
    let i = 0
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      i++
      setDisplayed(full.slice(0, i))
      if (i >= full.length && timerRef.current) clearInterval(timerRef.current)
    }, 18)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [quoteIdx, quotes])

  // Fake progress: crawl toward 90%
  useEffect(() => {
    setProgress(0)
    const steps = [
      { target: 15, delay: 300 },
      { target: 35, delay: 800 },
      { target: 55, delay: 1600 },
      { target: 72, delay: 2800 },
      { target: 85, delay: 4500 },
      { target: 90, delay: 7000 },
    ]
    const timeouts = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    )
    return () => timeouts.forEach(clearTimeout)
  }, [])

  const defaultLabel = lang === 'es' ? 'Consultando las fuentes...' : 'Consulting the sources...'

  return (
    <div className="bg-slate border border-gold/20 p-12 flex flex-col items-center gap-5">
      <span className="text-4xl animate-pulse">⚔</span>
      <div className="font-cinzel text-[0.6rem] tracking-[0.4em] text-gold uppercase">
        {label ?? defaultLabel}
      </div>
      <div className="loading-dots"><span /><span /><span /></div>
      <div className="ai-loading-quotes w-full max-w-md">
        {displayed}<span className="animate-pulse opacity-60">|</span>
      </div>
      <div className="ai-progress-track w-full max-w-xs">
        <div className="ai-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
