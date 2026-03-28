'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WAR QUOTE SECTION
// Rotating historical quotes between timeline and pricing
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import type { Lang } from '@/lib/data/types'

interface WarQuoteSectionProps {
  lang: Lang
}

const QUOTES = [
  {
    text_es: 'En la guerra, la moral es a lo físico como tres es a uno.',
    text_en: 'In war, the moral is to the physical as three is to one.',
    author: 'Napoleón Bonaparte',
  },
  {
    text_es: 'El arte de la guerra es de vital importancia para el Estado.',
    text_en: 'The art of war is of vital importance to the State.',
    author: 'Sun Tzu',
  },
  {
    text_es: 'La guerra es la continuación de la política por otros medios.',
    text_en: 'War is the continuation of politics by other means.',
    author: 'Carl von Clausewitz',
  },
  {
    text_es: 'El valor de la victoria solo se puede medir en comparación con lo que se arriesga.',
    text_en: 'The value of victory can only be measured against what is risked.',
    author: 'Julius Caesar',
  },
  {
    text_es: 'Quien desea la paz debe prepararse para la guerra.',
    text_en: 'Those who desire peace must prepare for war.',
    author: 'Vegetius',
  },
]

export function WarQuoteSection({ lang }: WarQuoteSectionProps) {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % QUOTES.length)
        setFading(false)
      }, 400)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const quote = QUOTES[idx]
  const text = lang === 'en' ? quote.text_en : quote.text_es

  return (
    <section className="war-quote-section">
      <div
        className="max-w-3xl mx-auto text-center"
        style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        <div className="font-cinzel text-[0.55rem] tracking-[0.45em] text-gold uppercase mb-6">
          {lang === 'en' ? '✦ Words of War ✦' : '✦ Palabras de Guerra ✦'}
        </div>
        <blockquote className="war-quote-text">
          &ldquo;{text}&rdquo;
        </blockquote>
        <cite className="war-quote-author">&mdash; {quote.author}</cite>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false) }, 400) }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-gold scale-125' : 'bg-smoke/40 hover:bg-smoke/60'}`}
              aria-label={`Quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
