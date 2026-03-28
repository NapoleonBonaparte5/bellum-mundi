'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — HERO SECTION (v3 — live battle feed)
// Left: title + stats + CTAs  |  Right: animated battle feed
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import type { Lang } from '@/lib/data/types'

// ── Batalla del Día — 14 batallas icónicas (B6: deterministic by date) ─
const DAILY_BATTLES = [
  { slug: 'batalla-de-maraton',          nameES: 'Batalla de Maratón',           nameEN: 'Battle of Marathon',         year: '490 a.C.', factES: '10.000 atenienses vencieron a 25.000 persas', factEN: '10,000 Athenians defeated 25,000 Persians' },
  { slug: 'batalla-de-las-termopilas',   nameES: 'Batalla de las Termópilas',    nameEN: 'Battle of Thermopylae',      year: '480 a.C.', factES: '300 espartanos — el sacrificio que salvó Grecia', factEN: '300 Spartans — the sacrifice that saved Greece' },
  { slug: 'batalla-de-cannas',           nameES: 'Batalla de Cannas',            nameEN: 'Battle of Cannae',           year: '216 a.C.', factES: 'El envolvimiento perfecto: 70.000 romanos en una tarde', factEN: 'The perfect encirclement: 70,000 Romans in one afternoon' },
  { slug: 'batalla-de-gaugamela',        nameES: 'Batalla de Gaugamela',         nameEN: 'Battle of Gaugamela',        year: '331 a.C.', factES: 'Alejandro Magno conquista el Imperio Persa', factEN: 'Alexander the Great conquers the Persian Empire' },
  { slug: 'batalla-de-hastings',         nameES: 'Batalla de Hastings',          nameEN: 'Battle of Hastings',         year: '1066',     factES: 'Un día que transformó para siempre la lengua inglesa', factEN: 'One day that forever transformed the English language' },
  { slug: 'caida-de-constantinopla',     nameES: 'Caída de Constantinopla',      nameEN: 'Fall of Constantinople',     year: '1453',     factES: '1.000 años de Imperio Romano de Oriente terminaron en un día', factEN: '1,000 years of Eastern Roman Empire ended in one day' },
  { slug: 'batalla-de-lepanto',          nameES: 'Batalla de Lepanto',           nameEN: 'Battle of Lepanto',          year: '1571',     factES: '400 galeras: el fin de la supremacía naval otomana', factEN: '400 galleys: the end of Ottoman naval supremacy' },
  { slug: 'batalla-de-viena',            nameES: 'Batalla de Viena',             nameEN: 'Battle of Vienna',           year: '1683',     factES: 'Europa occidental se salvó del avance otomano', factEN: 'Western Europe was saved from the Ottoman advance' },
  { slug: 'batalla-de-austerlitz',       nameES: 'Batalla de Austerlitz',        nameEN: 'Battle of Austerlitz',       year: '1805',     factES: 'La obra maestra de Napoleón: 73.000 vs 85.000', factEN: "Napoleon's masterpiece: 73,000 vs 85,000" },
  { slug: 'batalla-de-waterloo',         nameES: 'Batalla de Waterloo',          nameEN: 'Battle of Waterloo',         year: '1815',     factES: '200.000 soldados — el fin del dominio napoleónico', factEN: '200,000 soldiers — the end of Napoleon\'s dominion' },
  { slug: 'batalla-del-somme',           nameES: 'Batalla del Somme',            nameEN: 'Battle of the Somme',        year: '1916',     factES: '60.000 bajas británicas en el primer día', factEN: '60,000 British casualties on the first day' },
  { slug: 'batalla-de-verdun',           nameES: 'Batalla de Verdún',            nameEN: 'Battle of Verdun',           year: '1916',     factES: '300.000 muertos en 10 meses — el infierno del frente oeste', factEN: '300,000 dead in 10 months — the hell of the Western Front' },
  { slug: 'batalla-de-stalingrado',      nameES: 'Batalla de Stalingrado',       nameEN: 'Battle of Stalingrad',       year: '1942',     factES: '2 millones de bajas — el punto de inflexión de la guerra', factEN: '2 million casualties — the turning point of the war' },
  { slug: 'dia-d-operacion-overlord',    nameES: 'Día D — Operación Overlord',   nameEN: 'D-Day — Operation Overlord', year: '1944',     factES: 'La mayor operación anfibia de la historia: 156.000 soldados', factEN: 'The largest amphibious operation in history: 156,000 troops' },
]

// 20 iconic battles across all eras — hardcoded for hero performance
const FEED_BATTLES = [
  { year: '490 BC',    era: 'ANTIQUITY',    color: '#C9A84C', name: 'Battle of Marathon',          nameES: 'Batalla de Maratón',              stat: '10,000 vs 25,000' },
  { year: '480 BC',    era: 'ANTIQUITY',    color: '#C9A84C', name: 'Battle of Thermopylae',       nameES: 'Batalla de las Termópilas',        stat: '300 Spartans' },
  { year: '216 BC',    era: 'ANTIQUITY',    color: '#C9A84C', name: 'Battle of Cannae',            nameES: 'Batalla de Cannas',                stat: '70,000 Romans killed' },
  { year: '1066',      era: 'MIDDLE AGES',  color: '#8B6914', name: 'Battle of Hastings',          nameES: 'Batalla de Hastings',              stat: 'England transformed' },
  { year: '1187',      era: 'MIDDLE AGES',  color: '#8B6914', name: 'Battle of Hattin',            nameES: 'Batalla de los Cuernos de Hattin', stat: 'Jerusalem falls' },
  { year: '1242',      era: 'MIDDLE AGES',  color: '#8B6914', name: 'Battle on the Ice',           nameES: 'Batalla del Hielo',                stat: 'Russia saved' },
  { year: '1453',      era: 'EARLY MODERN', color: '#C0392B', name: 'Fall of Constantinople',      nameES: 'Caída de Constantinopla',          stat: '1,000 years ended' },
  { year: '1571',      era: 'EARLY MODERN', color: '#C0392B', name: 'Battle of Lepanto',           nameES: 'Batalla de Lepanto',               stat: '400 ships, 150,000 men' },
  { year: '1683',      era: 'EARLY MODERN', color: '#C0392B', name: 'Battle of Vienna',            nameES: 'Batalla de Viena',                 stat: 'Europe defended' },
  { year: '1709',      era: 'EARLY MODERN', color: '#C0392B', name: 'Battle of Poltava',           nameES: 'Batalla de Poltava',               stat: 'Sweden broken' },
  { year: '1805',      era: 'NAPOLEONIC',   color: '#E8C97A', name: 'Battle of Austerlitz',        nameES: 'Batalla de Austerlitz',            stat: "Napoleon's masterpiece" },
  { year: '1815',      era: 'NAPOLEONIC',   color: '#E8C97A', name: 'Battle of Waterloo',          nameES: 'Batalla de Waterloo',              stat: '200,000 troops' },
  { year: '1916',      era: 'WORLD WAR I',  color: '#6B6560', name: 'Battle of the Somme',         nameES: 'Batalla del Somme',                stat: '1 million casualties' },
  { year: '1916',      era: 'WORLD WAR I',  color: '#6B6560', name: 'Battle of Verdun',            nameES: 'Batalla de Verdún',                stat: '300,000 dead' },
  { year: '1942',      era: 'WORLD WAR II', color: '#9B9590', name: 'Battle of Stalingrad',        nameES: 'Batalla de Stalingrado',           stat: '2 million casualties' },
  { year: '1944',      era: 'WORLD WAR II', color: '#9B9590', name: 'D-Day — Operation Overlord',  nameES: 'Día D — Operación Overlord',       stat: '156,000 troops' },
  { year: '1944',      era: 'WORLD WAR II', color: '#9B9590', name: 'Battle of Kursk',             nameES: 'Batalla de Kursk',                 stat: '6,000 tanks' },
  { year: '1950',      era: 'COLD WAR',     color: '#3D7A8A', name: 'Battle of Inchon',            nameES: 'Batalla de Inchon',                stat: "MacArthur's gamble" },
  { year: '1968',      era: 'COLD WAR',     color: '#3D7A8A', name: 'Tet Offensive',               nameES: 'Ofensiva del Tet',                 stat: 'Vietnam turned' },
  { year: '2022',      era: 'CONTEMPORARY', color: '#4A7C59', name: 'Battle of Kyiv',              nameES: 'Batalla de Kyiv',                  stat: '40,000 Russian troops' },
]

// Duplicate for seamless infinite scroll
const ALL_BATTLES = [...FEED_BATTLES, ...FEED_BATTLES]

const ITEM_H = 72 // px per feed item

interface HeroSectionProps { lang: Lang }

export function HeroSection({ lang }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const feedRef  = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const isES = lang === 'es'

  // Batalla del Día — deterministic by calendar date (B6)
  const dailyBattle = useMemo(() => {
    const d = new Date()
    const idx = (d.getFullYear() * 365 + d.getMonth() * 31 + d.getDate()) % DAILY_BATTLES.length
    return DAILY_BATTLES[idx]
  }, [])

  // Parallax scroll (B2)
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Particle canvas ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let animId: number
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    type PType = 'star' | 'dust' | 'ember'
    interface P { x:number;y:number;vx:number;vy:number;r:number;a:number;aBase:number;type:PType;phase:number;speed:number }
    const makeP = (): P => {
      const roll = Math.random()
      const type: PType = roll < 0.5 ? 'star' : roll < 0.8 ? 'dust' : 'ember'
      return { x:Math.random()*W, y:Math.random()*H,
        vx:type==='dust'?(Math.random()*0.4+0.1):(Math.random()-0.5)*0.2,
        vy:type==='ember'?-(Math.random()*0.5+0.2):(Math.random()-0.5)*0.15,
        r:type==='star'?(Math.random()*1.2+0.6):(Math.random()*0.8+0.3),
        a:Math.random()*0.35+0.08, aBase:Math.random()*0.35+0.08,
        type, phase:Math.random()*Math.PI*2, speed:Math.random()*0.02+0.005 }
    }
    const pts: P[] = Array.from({ length: 90 }, makeP)
    let tick = 0

    function draw() {
      if (!ctx) return
      ctx.clearRect(0,0,W,H); tick++
      const g = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)/1.5)
      g.addColorStop(0,'rgba(50,20,5,0.7)'); g.addColorStop(0.5,'rgba(20,8,3,0.85)'); g.addColorStop(1,'rgba(5,3,1,1)')
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
      pts.forEach(p => {
        if(p.type==='star'){p.a=p.aBase*(0.5+0.5*Math.sin(tick*p.speed+p.phase));p.x+=p.vx;p.y+=p.vy}
        else if(p.type==='dust'){p.x+=p.vx;p.y+=Math.sin(tick*p.speed+p.phase)*0.3;if(p.x>W+10){p.x=-10;p.y=Math.random()*H}}
        else{p.vy-=0.002;p.x+=p.vx+Math.sin(tick*p.speed+p.phase)*0.4;p.y+=p.vy;p.a=p.aBase*Math.max(0,p.y/H);if(p.y<-10){p.y=H+10;p.x=Math.random()*W;p.vy=-(Math.random()*0.5+0.2);p.a=p.aBase}}
        if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10
        if(p.y<-10&&p.type!=='ember')p.y=H+10;if(p.y>H+10&&p.type!=='ember')p.y=-10
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=p.type==='ember'?`rgba(220,140,60,${p.a})`:`rgba(201,168,76,${p.a})`;ctx.fill()
      })
      const stars=pts.filter(p=>p.type==='star')
      for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
        const dx=stars[i].x-stars[j].x,dy=stars[i].y-stars[j].y,d=Math.sqrt(dx*dx+dy*dy)
        if(d<110){ctx.beginPath();ctx.moveTo(stars[i].x,stars[i].y);ctx.lineTo(stars[j].x,stars[j].y);ctx.strokeStyle=`rgba(201,168,76,${0.06*(1-d/110)})`;ctx.lineWidth=0.5;ctx.stroke()}
      }
      animId=requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize',onResize); cancelAnimationFrame(animId) }
  }, [])

  // ── Auto-scroll feed (transform-based, no reflow) ─────────
  useEffect(() => {
    const el = feedRef.current
    if (!el) return
    let pos = 0
    let raf: number
    const TOTAL = FEED_BATTLES.length * ITEM_H
    function step() {
      if (!paused) {
        pos += 0.4
        if (pos >= TOTAL) pos = 0
        if (el) el.style.transform = `translateY(-${pos}px)`
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [paused])

  return (
    <section id="hero" className="relative overflow-hidden isolate" style={{ minHeight: '100vh' }}>
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Parallax mist layer (B2) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          transform: `translateY(${scrollY * 0.25}px)`,
          background: `radial-gradient(ellipse 70% 50% at 25% 35%, rgba(201,168,76,0.04) 0%, transparent 55%),
                       radial-gradient(ellipse 60% 40% at 75% 60%, rgba(139,26,26,0.05) 0%, transparent 55%)`,
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Dramatic radial gradient overlay (1C) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `radial-gradient(ellipse 120% 80% at 50% 100%, rgba(139,26,26,0.15) 0%, transparent 60%),
                       radial-gradient(ellipse 80% 60% at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      {/* Tactical grid overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A84C' stroke-width='0.4' opacity='0.06'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3C/g%3E%3C/svg%3E")` }}
        aria-hidden="true"
      />

      {/* Split layout */}
      <div
        className="relative z-10 max-w-content mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
        style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '3rem' }}
      >
        {/* ── LEFT: text column ── */}
        <div className="flex-1 flex flex-col items-start">
          <p className="font-cinzel text-gold uppercase mb-6" style={{ fontSize: '0.68rem', letterSpacing: '0.45em' }}>
            Encyclopaedia Militaris Universalis
          </p>

          <h1
            className="font-cinzel font-black text-cream leading-none mb-6"
            style={{ fontSize: 'clamp(3rem,8vw,7rem)', letterSpacing: '-0.02em', textShadow: '0 0 60px rgba(201,168,76,0.25),0 4px 30px rgba(0,0,0,0.8)' }}
          >
            BELLUM{' '}
            <span style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C97A,#C9A84C)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              MUNDI
            </span>
          </h1>

          <p
            className="font-playfair italic text-parchment-dark mb-8"
            style={{ fontSize: 'clamp(1rem,2vw,1.35rem)', lineHeight: 1.6, maxWidth: '520px' }}
          >
            {isES
              ? 'Historia militar del mundo — desde los primeros conflictos prehistóricos hasta la guerra moderna. Análisis con IA, mapas interactivos y 12.000 años de estrategia.'
              : 'Military history of the world — from the first prehistoric conflicts to modern warfare. AI-powered analysis, interactive maps and 12,000 years of strategy.'}
          </p>

          <div className="flex gap-4 flex-wrap mb-10">
            <Link href={`/${lang}/batallas`} className="btn-primary" style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}>
              {isES ? '⚔ Explorar Batallas' : '⚔ Explore Battles'}
            </Link>
            <Link href={`/${lang}/comandantes`} className="btn-ghost" style={{ fontSize: '0.65rem', letterSpacing: '0.2em' }}>
              {isES ? '👑 Ver Comandantes' : '👑 Browse Commanders'}
            </Link>
          </div>

          {/* Inline stats bar */}
          <div className="flex flex-wrap gap-6 items-center" style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '1.5rem' }}>
            {[
              { n: '890+', label: isES ? 'Batallas' : 'Battles' },
              { n: '500+', label: isES ? 'Comandantes' : 'Commanders' },
              { n: '118',  label: isES ? 'Civilizaciones' : 'Civilizations' },
              { n: '12K',  label: isES ? 'Años de Historia' : 'Years of History' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-cinzel font-black text-gold" style={{ fontSize: '1.4rem', lineHeight: 1 }}>{s.n}</span>
                <span className="font-cinzel text-smoke uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', marginTop: '0.2rem' }}>{s.label}</span>
              </div>
            ))}
          </div>
          {/* ── Batalla del Día banner (B6 — deterministic) ── */}
          <div
            className="w-full mt-8"
            style={{
              background: 'rgba(139,26,26,0.12)',
              borderLeft: '3px solid var(--crimson)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.48rem',
                letterSpacing: '0.25em',
                color: 'var(--crimson-light)',
                textTransform: 'uppercase',
                fontWeight: 700,
                flexShrink: 0,
                border: '1px solid rgba(192,57,43,0.4)',
                padding: '2px 8px',
              }}
            >
              {isES ? 'Batalla del Día' : 'Battle of the Day'}
            </span>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--cream)',
                  display: 'block',
                  lineHeight: 1.2,
                }}
              >
                {isES ? dailyBattle.nameES : dailyBattle.nameEN}
                <span
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    color: 'var(--gold)',
                    marginLeft: '0.6rem',
                    fontWeight: 400,
                  }}
                >
                  {dailyBattle.year}
                </span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-crimson)',
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  color: 'var(--smoke)',
                  display: 'block',
                  marginTop: '0.2rem',
                }}
              >
                {isES ? dailyBattle.factES : dailyBattle.factEN}
              </span>
            </div>
            <Link
              href={`/${lang}/batallas/${dailyBattle.slug}`}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.55rem',
                letterSpacing: '0.15em',
                color: 'var(--gold)',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold-light)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
            >
              {isES ? '→ Ver análisis' : '→ View analysis'}
            </Link>
          </div>
        </div>

        {/* ── RIGHT: BOTD card + live battle feed ── */}
        <div className="lg:w-[400px] xl:w-[460px] w-full flex-shrink-0 flex flex-col" style={{ gap: '1rem' }}>

          {/* Batalla del Día — prominent card */}
          <Link
            href={`/${lang}/batallas/${dailyBattle.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(139,26,26,0.25) 0%, rgba(10,8,6,0.9) 100%)',
                border: '1px solid rgba(192,57,43,0.4)',
                borderLeft: '3px solid var(--crimson)',
                padding: '1.1rem 1.4rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(192,57,43,0.75)'
                el.style.boxShadow = '0 8px 30px rgba(139,26,26,0.3)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(192,57,43,0.4)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Glow effect */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 10% 50%, rgba(139,26,26,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.44rem', letterSpacing: '0.28em', color: 'var(--crimson-light)', textTransform: 'uppercase', fontWeight: 700, border: '1px solid rgba(192,57,43,0.45)', padding: '2px 7px', flexShrink: 0 }}>
                  {isES ? '⚔ Batalla del Día' : '⚔ Battle of the Day'}
                </span>
                <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.52rem', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 700 }}>
                  {dailyBattle.year}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--cream)', lineHeight: 1.2, position: 'relative', marginBottom: '0.35rem' }}>
                {isES ? dailyBattle.nameES : dailyBattle.nameEN}
              </div>
              <div style={{ fontFamily: 'var(--font-crimson)', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--smoke)', lineHeight: 1.4, position: 'relative' }}>
                {isES ? dailyBattle.factES : dailyBattle.factEN}
              </div>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.48rem', letterSpacing: '0.18em', color: 'var(--gold)', marginTop: '0.65rem', position: 'relative', opacity: 0.8 }}>
                {isES ? '→ VER ANÁLISIS COMPLETO' : '→ VIEW FULL ANALYSIS'}
              </div>
            </div>
          </Link>

          {/* Scrolling battle feed */}
          <div
            className="flex flex-col"
            style={{ height: '380px' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
          {/* Feed header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.07)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}
          >
            <span className="font-cinzel text-gold uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.25em' }}>
              {isES ? '⚔ Batallas Históricas' : '⚔ Historical Battles'}
            </span>
            <span className="font-cinzel text-smoke" style={{ fontSize: '0.5rem', letterSpacing: '0.12em' }}>
              {isES ? 'REGISTRO COMPLETO' : 'FULL RECORD'}
            </span>
          </div>

          {/* Scrolling window */}
          <div className="flex-1 overflow-hidden relative" style={{ background: 'rgba(10,8,6,0.7)' }}>
            {/* Top fade */}
            <div
              className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
              style={{ height: '40px', background: 'linear-gradient(to bottom, rgba(10,8,6,0.9), transparent)' }}
            />
            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
              style={{ height: '60px', background: 'linear-gradient(to top, rgba(10,8,6,0.9), transparent)' }}
            />

            {/* Animated list */}
            <div ref={feedRef} style={{ willChange: 'transform' }}>
              {ALL_BATTLES.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4"
                  style={{
                    height: `${ITEM_H}px`,
                    borderBottom: '1px solid rgba(201,168,76,0.06)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.04)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {/* Era color bar */}
                  <div className="flex-shrink-0">
                    <div style={{ width: '3px', height: '28px', background: b.color, borderRadius: '2px', opacity: 0.7 }} />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-cinzel text-gold flex-shrink-0" style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                        {b.year}
                      </span>
                      <span className="font-cinzel text-smoke" style={{ fontSize: '0.48rem', letterSpacing: '0.1em', opacity: 0.6 }}>
                        {b.era}
                      </span>
                    </div>
                    <div className="font-playfair font-bold text-cream truncate" style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                      {isES ? b.nameES : b.name}
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="flex-shrink-0 text-right" style={{ maxWidth: '100px' }}>
                    <span className="font-cinzel text-smoke" style={{ fontSize: '0.48rem', letterSpacing: '0.06em', lineHeight: 1.4, display: 'block', opacity: 0.7 }}>
                      {b.stat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <Link
            href={`/${lang}/batallas`}
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'rgba(201,168,76,0.05)', borderTop: '1px solid rgba(201,168,76,0.15)', transition: 'background 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.05)' }}
          >
            <span className="font-cinzel text-gold uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.2em' }}>
              {isES ? 'Ver las 890+ batallas' : 'Browse all 890+ battles'}
            </span>
            <span className="text-gold" style={{ fontSize: '0.8rem' }}>→</span>
          </Link>
          </div>{/* end inner feed wrapper */}
        </div>{/* end right column */}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-smoke pointer-events-none z-10"
        style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.6rem', letterSpacing: '0.4em' }}
        aria-hidden="true"
      >
        <span className="opacity-60">{isES ? 'DESCENDER' : 'SCROLL'}</span>
        <div className="w-px h-[50px] bg-gradient-to-b from-gold to-transparent animate-scroll-pulse" />
      </div>
    </section>
  )
}
