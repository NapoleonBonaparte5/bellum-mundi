'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — HERO SECTION
// Particle canvas + animated title + CTA buttons
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n/translations'

interface HeroSectionProps {
  lang: Lang
}

export function HeroSection({ lang }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Particle canvas animation ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let animId: number

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // 80 gold particles
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.4 + 0.1,
    }))

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // Radial gradient background
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.5)
      g.addColorStop(0, 'rgba(50,20,5,0.6)')
      g.addColorStop(0.5, 'rgba(20,8,3,0.8)')
      g.addColorStop(1, 'rgba(5,3,1,1)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // Particles
      pts.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${p.a})`
        ctx.fill()
      })

      // Connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(201,168,76,${0.08 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center items-center text-center relative overflow-hidden px-8 py-16 isolation-isolate"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        <p className="font-cinzel text-[0.75rem] tracking-[0.5em] text-gold uppercase mb-8 opacity-0 animate-[fadeUp_1s_0.3s_forwards]">
          {t(lang, 'hero_ornament')}
        </p>

        <h1 className="font-cinzel font-black text-cream leading-[0.9] tracking-tight [text-shadow:0_0_80px_rgba(201,168,76,0.3),0_4px_40px_rgba(0,0,0,0.8)] opacity-0 animate-[fadeUp_1s_0.5s_forwards]"
          style={{ fontSize: 'clamp(3.5rem,10vw,9rem)' }}
        >
          BELLUM <span className="text-gold">MUNDI</span>
        </h1>

        <p
          className="font-playfair italic text-parchment-dark mt-6 tracking-[0.05em] opacity-0 animate-[fadeUp_1s_0.7s_forwards]"
          style={{ fontSize: 'clamp(1.1rem,2.5vw,1.6rem)' }}
          dangerouslySetInnerHTML={{ __html: t(lang, 'hero_subtitle') }}
        />

        {/* Gold rule */}
        <div className="w-[200px] h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-8 opacity-0 animate-[fadeUp_1s_0.9s_forwards]" />

        <p className="font-cinzel text-[0.7rem] tracking-[0.4em] text-smoke opacity-0 animate-[fadeUp_1s_1.1s_forwards]">
          {t(lang, 'hero_meta')}
        </p>

        <div className="flex gap-4 justify-center mt-10 flex-wrap opacity-0 animate-[fadeUp_1s_1.3s_forwards] relative z-10">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t(lang, 'hero_explore')}
          </button>
          <Link href={`/${lang}#pricing`} className="btn-ghost">
            {t(lang, 'hero_premium')}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-smoke font-cinzel text-[0.6rem] tracking-[0.4em] opacity-0 animate-[fadeUp_1s_1.7s_forwards] pointer-events-none z-10"
        aria-hidden="true"
      >
        <span>{t(lang, 'hero_scroll')}</span>
        <div className="w-px h-[60px] bg-gradient-to-b from-gold to-transparent animate-scroll-pulse" />
      </div>
    </section>
  )
}
