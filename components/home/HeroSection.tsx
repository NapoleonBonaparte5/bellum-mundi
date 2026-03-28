'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — HERO SECTION
// Particle canvas + animated title + CTA buttons
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/data/types'
import { t } from '@/lib/i18n'

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

    // Three particle types: star (twinkle), dust (horizontal float), ember (rises)
    type ParticleType = 'star' | 'dust' | 'ember'
    interface Particle {
      x: number; y: number; vx: number; vy: number
      r: number; a: number; aBase: number
      type: ParticleType; phase: number; speed: number
    }

    function makeParticle(): Particle {
      const roll = Math.random()
      const type: ParticleType = roll < 0.5 ? 'star' : roll < 0.8 ? 'dust' : 'ember'
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: type === 'dust' ? (Math.random() * 0.4 + 0.1) : (Math.random() - 0.5) * 0.2,
        vy: type === 'ember' ? -(Math.random() * 0.5 + 0.2) : (Math.random() - 0.5) * 0.15,
        r: type === 'star' ? (Math.random() * 1.2 + 0.6) : (Math.random() * 0.8 + 0.3),
        a: Math.random() * 0.35 + 0.08,
        aBase: Math.random() * 0.35 + 0.08,
        type,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      }
    }

    const pts: Particle[] = Array.from({ length: 100 }, makeParticle)
    let tick = 0

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      tick++

      // Radial gradient background
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.5)
      g.addColorStop(0, 'rgba(50,20,5,0.6)')
      g.addColorStop(0.5, 'rgba(20,8,3,0.8)')
      g.addColorStop(1, 'rgba(5,3,1,1)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      // Particles
      pts.forEach(p => {
        if (p.type === 'star') {
          // Sinusoidal twinkle
          p.a = p.aBase * (0.5 + 0.5 * Math.sin(tick * p.speed + p.phase))
          p.x += p.vx
          p.y += p.vy
        } else if (p.type === 'dust') {
          // Horizontal float with gentle undulation
          p.x += p.vx
          p.y += Math.sin(tick * p.speed + p.phase) * 0.3
          if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H }
        } else {
          // Ember rises and fades
          p.vy -= 0.002
          p.x += p.vx + Math.sin(tick * p.speed + p.phase) * 0.4
          p.y += p.vy
          p.a = p.aBase * Math.max(0, p.y / H)
          if (p.y < -10) {
            p.y = H + 10
            p.x = Math.random() * W
            p.vy = -(Math.random() * 0.5 + 0.2)
            p.a = p.aBase
          }
        }
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10 && p.type !== 'ember') { p.y = H + 10 }
        if (p.y > H + 10 && p.type !== 'ember') { p.y = -10 }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.type === 'ember'
          ? `rgba(220,140,60,${p.a})`
          : `rgba(201,168,76,${p.a})`
        ctx.fill()
      })

      // Connecting lines (stars only)
      const stars = pts.filter(p => p.type === 'star')
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(201,168,76,${0.07 * (1 - d / 110)})`
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
      className="min-h-screen flex flex-col justify-center items-center text-center relative overflow-hidden px-8 py-16 isolate"
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
          {t(lang, 'home.hero.ornament')}
        </p>

        <h1 className="font-cinzel font-black text-cream leading-[0.9] tracking-tight [text-shadow:0_0_80px_rgba(201,168,76,0.3),0_4px_40px_rgba(0,0,0,0.8)] opacity-0 animate-[fadeUp_1s_0.5s_forwards]"
          style={{ fontSize: 'clamp(3.5rem,10vw,9rem)' }}
        >
          BELLUM <span className="text-gold">MUNDI</span>
        </h1>

        <p
          className="font-playfair italic text-parchment-dark mt-6 tracking-[0.05em] opacity-0 animate-[fadeUp_1s_0.7s_forwards]"
          style={{ fontSize: 'clamp(1.1rem,2.5vw,1.6rem)' }}
          dangerouslySetInnerHTML={{ __html: t(lang, 'home.hero.subtitle') }}
        />

        {/* Gold rule */}
        <div className="w-[200px] h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-8 opacity-0 animate-[fadeUp_1s_0.9s_forwards]" />

        <p className="font-cinzel text-[0.7rem] tracking-[0.4em] text-smoke opacity-0 animate-[fadeUp_1s_1.1s_forwards]">
          {t(lang, 'home.hero.meta')}
        </p>

        <div className="flex gap-4 justify-center mt-10 flex-wrap opacity-0 animate-[fadeUp_1s_1.3s_forwards] relative z-10">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t(lang, 'home.hero.explore')}
          </button>
          <Link href={`/${lang}#pricing`} className="btn-ghost">
            {t(lang, 'home.hero.premium')}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-smoke font-cinzel text-[0.6rem] tracking-[0.4em] opacity-0 animate-[fadeUp_1s_1.7s_forwards] pointer-events-none z-10"
        aria-hidden="true"
      >
        <span>{t(lang, 'home.hero.scroll')}</span>
        <div className="w-px h-[60px] bg-gradient-to-b from-gold to-transparent animate-scroll-pulse" />
      </div>
    </section>
  )
}
