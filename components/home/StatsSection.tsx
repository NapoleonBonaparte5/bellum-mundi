'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — STATS SECTION
// Animated counter numbers: years, battles, civs, commanders
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n'

interface StatProps {
  value: number
  suffix?: string
  label: string
  duration?: number
}

function StatCounter({ value, suffix = '', label, duration = 1800 }: StatProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(2, -10 * progress) // easeOutExpo
            setDisplay(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(step)
            else setDisplay(value)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div ref={ref} className="bg-slate p-8 text-center flex flex-col items-center gap-2">
      <div className="font-cinzel font-black text-4xl md:text-5xl text-gold">
        {display.toLocaleString('es-ES')}{suffix}
      </div>
      <div className="font-cinzel text-[0.6rem] tracking-[0.3em] text-smoke uppercase">
        {label}
      </div>
    </div>
  )
}

interface StatsSectionProps {
  lang: Lang
}

export function StatsSection({ lang }: StatsSectionProps) {
  return (
    <section className="py-4 px-4 md:px-8 max-w-content mx-auto">
      <div className="stats-row">
        <StatCounter value={890} suffix="+" label={t(lang, 'home.stats.battles')} duration={1400} />
        <StatCounter value={244} suffix="+" label={t(lang, 'home.stats.commanders')} duration={1200} />
        <StatCounter value={118} suffix="+" label={t(lang, 'home.stats.civs')} duration={1600} />
        <StatCounter value={100} suffix="+" label={t(lang, 'home.stats.docs')} />
      </div>
    </section>
  )
}
