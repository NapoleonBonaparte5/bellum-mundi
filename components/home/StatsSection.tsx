'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — STATS SECTION
// Animated counter numbers: years, battles, civs, commanders
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'

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
            const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
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
    <section className="py-4 px-4 max-w-content mx-auto">
      <div className="stats-row">
        <StatCounter value={50000} suffix="+" label={t(lang, 'stat_years')} />
        <StatCounter value={429} suffix="+" label={t(lang, 'stat_battles')} duration={1400} />
        <StatCounter value={63} suffix="+" label={t(lang, 'stat_civs')} duration={1600} />
        <StatCounter value={109} suffix="+" label={t(lang, 'stat_commanders')} duration={1200} />
      </div>
    </section>
  )
}
