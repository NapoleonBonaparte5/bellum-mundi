'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — GLOBAL MILITARY TIMELINE (Canvas)
// Zoom + pan · 2000+ battles · 50 000 years
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'
import { slugify } from '@/lib/data/helpers'
import { translateCombatants, translateYear, getEraName } from '@/lib/i18n'

interface GlobalTimelineProps {
  battles: FlatBattle[]
  lang: Lang
}

// ── Year parser ──────────────────────────────────────────────
function parseYear(s: string): number {
  // Remove thousands separators (Spanish: 50.000 → 50000)
  const clean = s.trim().replace(/(\d)\.(\d{3})/g, '$1$2')
  // a.C. / A.C. / aC → negative
  const bc = clean.match(/(\d+)\s*a\.?\s*[Cc]\.?/)
  if (bc) return -parseInt(bc[1])
  // Month prefix: "Jun 1944", "Sep 1939"
  const mo = clean.match(/[A-Za-záéíóúü]+\.?\s+(\d{4})/)
  if (mo) return parseInt(mo[1])
  // Four-digit year
  const yr = clean.match(/\b(\d{4})\b/)
  if (yr) return parseInt(yr[1])
  return 0
}

// ── Era definitions ──────────────────────────────────────────
interface EraBand {
  id: EraId
  nameEs: string
  nameEn: string
  start: number
  end: number
  color: string       // fill
  dotColor: string    // battle dot
  textColor: string
}

const ERA_BANDS: EraBand[] = [
  { id: 'prehistoric',  nameEs: 'Prehistoria',    nameEn: 'Prehistoric',    start: -50000, end: -3001, color: 'rgba(210,150, 50,0.15)', dotColor: '#D49632', textColor: '#D49632' },
  { id: 'ancient',      nameEs: 'Antigüedad',     nameEn: 'Ancient',        start: -3000,  end: -501,  color: 'rgba(180,100, 40,0.15)', dotColor: '#B4641E', textColor: '#C87832' },
  { id: 'classical',    nameEs: 'Clásica',        nameEn: 'Classical',      start: -500,   end:  499,  color: 'rgba( 65,105,225,0.12)', dotColor: '#4169E1', textColor: '#6488E8' },
  { id: 'medieval',     nameEs: 'Medieval',       nameEn: 'Medieval',       start:  500,   end: 1499,  color: 'rgba(128,  0,  0,0.12)', dotColor: '#A01010', textColor: '#C03030' },
  { id: 'early_modern', nameEs: 'Edad Moderna',   nameEn: 'Early Modern',   start: 1500,   end: 1799,  color: 'rgba( 46,139, 87,0.12)', dotColor: '#2E8B57', textColor: '#3BAB6A' },
  { id: 'napoleon',     nameEs: 'Napoleónica',    nameEn: 'Napoleonic',     start: 1800,   end: 1824,  color: 'rgba(220, 20, 60,0.15)', dotColor: '#DC143C', textColor: '#F03060' },
  { id: 'ww1',          nameEs: 'Primera GM',     nameEn: 'World War I',    start: 1914,   end: 1919,  color: 'rgba(100,100,100,0.18)', dotColor: '#888888', textColor: '#AAAAAA' },
  { id: 'ww2',          nameEs: 'Segunda GM',     nameEn: 'World War II',   start: 1939,   end: 1946,  color: 'rgba(180, 30, 30,0.20)', dotColor: '#B41E1E', textColor: '#D04040' },
  { id: 'cold_war',     nameEs: 'Guerra Fría',    nameEn: 'Cold War',       start: 1946,   end: 1991,  color: 'rgba( 70,130,180,0.12)', dotColor: '#4682B4', textColor: '#5A9EC8' },
  { id: 'contemporary', nameEs: 'Contemporánea',  nameEn: 'Contemporary',   start: 1991,   end: 2025,  color: 'rgba(255, 99, 71,0.12)', dotColor: '#FF6347', textColor: '#FF7A5A' },
]

function getBand(year: number): EraBand {
  return ERA_BANDS.find(b => year >= b.start && year <= b.end) ?? ERA_BANDS[0]
}

// ── Canvas view state ────────────────────────────────────────
interface ViewState {
  centerYear: number   // year at horizontal center
  pxPerYear: number    // zoom level
}

const DEFAULT_VIEW: ViewState = { centerYear: 800, pxPerYear: 0.22 }
const MIN_PX_PER_YEAR = 0.001
const MAX_PX_PER_YEAR = 40

function yearToX(year: number, view: ViewState, w: number): number {
  return (year - view.centerYear) * view.pxPerYear + w / 2
}
function xToYear(x: number, view: ViewState, w: number): number {
  return (x - w / 2) / view.pxPerYear + view.centerYear
}

// ── Axis label intervals ─────────────────────────────────────
function axisInterval(pxPerYear: number): number {
  const targets = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  const idealPx = 120
  const ideal = idealPx / pxPerYear
  return targets.reduce((prev, cur) => Math.abs(cur - ideal) < Math.abs(prev - ideal) ? cur : prev)
}

// ── Tooltip state ────────────────────────────────────────────
interface TooltipState {
  battle: FlatBattle
  x: number
  y: number
}

// ══════════════════════════════════════════════════════════════
export function GlobalTimeline({ battles, lang }: GlobalTimelineProps) {
  const isES = lang === 'es'
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef     = useRef<ViewState>(DEFAULT_VIEW)
  const dragging    = useRef(false)
  const dragStartX  = useRef(0)
  const dragStartCenter = useRef(0)

  const [view, setView]               = useState<ViewState>(DEFAULT_VIEW)
  const [tooltip, setTooltip]         = useState<TooltipState | null>(null)
  const [selected, setSelected]       = useState<FlatBattle | null>(null)
  const [activeEras, setActiveEras]   = useState<Set<EraId>>(new Set())
  const [canvasSize, setCanvasSize]   = useState({ w: 1400, h: 340 })

  // Pre-parse all battle years once
  const parsedBattles = useRef(
    battles.map(b => ({ ...b, numYear: parseYear(b.year) }))
  )

  // Filter: if activeEras empty → show all
  const visibleBattles = activeEras.size === 0
    ? parsedBattles.current
    : parsedBattles.current.filter(b => activeEras.has(b.eraId))

  // ── Sync viewRef on state change ──────────────────────────
  useEffect(() => { viewRef.current = view }, [view])

  // ── Resize observer ───────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w > 0) setCanvasSize({ w, h: 340 })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // ── Draw ──────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = canvasSize
    const v = viewRef.current

    // Clear
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0A0D12'
    ctx.fillRect(0, 0, w, h)

    const AXIS_Y    = h - 56   // x-axis line y
    const BAND_TOP  = 24
    const BAND_H    = AXIS_Y - BAND_TOP - 12
    const DOT_Y     = AXIS_Y - 28
    const DOT_R     = Math.max(2, Math.min(5, v.pxPerYear * 1.5 + 1.5))

    // ── Era bands ──────────────────────────────────────────
    for (const band of ERA_BANDS) {
      const x1 = yearToX(band.start, v, w)
      const x2 = yearToX(band.end,   v, w)
      if (x2 < 0 || x1 > w) continue
      const bx = Math.max(0, x1)
      const bw = Math.min(w, x2) - bx

      ctx.fillStyle = band.color
      ctx.fillRect(bx, BAND_TOP, bw, BAND_H)

      // Era label (only if band is wide enough)
      if (bw > 60) {
        const labelX = Math.max(bx + 6, Math.min(bx + bw - 6, w / 2))
        ctx.save()
        ctx.font = '500 10px "Cinzel", serif'
        ctx.fillStyle = band.textColor
        ctx.globalAlpha = 0.7
        ctx.textAlign = 'center'
        ctx.fillText(isES ? band.nameEs : band.nameEn, labelX, BAND_TOP + 16)
        ctx.restore()
      }
    }

    // ── X-axis line ───────────────────────────────────────
    ctx.strokeStyle = 'rgba(218,165,32,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, AXIS_Y)
    ctx.lineTo(w, AXIS_Y)
    ctx.stroke()

    // ── Axis tick labels ──────────────────────────────────
    const interval = axisInterval(v.pxPerYear)
    const startYear = Math.ceil(xToYear(0, v, w) / interval) * interval
    const endYear   = Math.floor(xToYear(w, v, w) / interval) * interval

    ctx.font = '10px "Cinzel", serif'
    ctx.textAlign = 'center'

    for (let yr = startYear; yr <= endYear; yr += interval) {
      const x = yearToX(yr, v, w)
      // Tick
      ctx.strokeStyle = 'rgba(218,165,32,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, AXIS_Y - 4)
      ctx.lineTo(x, AXIS_Y + 4)
      ctx.stroke()
      // Label
      const label = yr < 0
        ? `${Math.abs(yr).toLocaleString(isES ? 'es' : 'en')} ${isES ? 'a.C.' : 'BC'}`
        : `${yr < 1000 ? yr : yr.toLocaleString(isES ? 'es' : 'en')}`
      ctx.fillStyle = 'rgba(180,170,150,0.7)'
      ctx.fillText(label, x, AXIS_Y + 16)
    }

    // ── Battle dots ───────────────────────────────────────
    for (const b of visibleBattles) {
      const x = yearToX(b.numYear, v, w)
      if (x < -10 || x > w + 10) continue
      const band = getBand(b.numYear)
      ctx.beginPath()
      ctx.arc(x, DOT_Y, DOT_R, 0, Math.PI * 2)
      ctx.fillStyle = band.dotColor
      ctx.globalAlpha = 0.85
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Highlight selected battle
    if (selected) {
      const x = yearToX(parseYear(selected.year), v, w)
      ctx.beginPath()
      ctx.arc(x, DOT_Y, DOT_R + 4, 0, Math.PI * 2)
      ctx.strokeStyle = '#DAA520'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // ── Year cursor / now line ────────────────────────────
    const nowX = yearToX(2024, v, w)
    if (nowX > 0 && nowX < w) {
      ctx.strokeStyle = 'rgba(255,99,71,0.4)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(nowX, BAND_TOP)
      ctx.lineTo(nowX, AXIS_Y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.font = '9px "Cinzel", serif'
      ctx.fillStyle = 'rgba(255,99,71,0.6)'
      ctx.textAlign = 'center'
      ctx.fillText('2024', nowX, BAND_TOP - 6)
    }
  }, [canvasSize, visibleBattles, selected, isES])

  // Re-draw whenever view, canvasSize, or filters change
  useEffect(() => { draw() }, [draw, view])

  // ── Mouse wheel zoom ──────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const v = viewRef.current
    const yearUnderMouse = xToYear(mouseX, v, canvasSize.w)
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    const newPx = Math.max(MIN_PX_PER_YEAR, Math.min(MAX_PX_PER_YEAR, v.pxPerYear * factor))
    // Keep yearUnderMouse at same screen position
    const newCenter = yearUnderMouse - (mouseX - canvasSize.w / 2) / newPx
    const next = { centerYear: newCenter, pxPerYear: newPx }
    viewRef.current = next
    setView(next)
  }, [canvasSize.w])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ── Mouse drag pan ────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragStartX.current = e.clientX
    dragStartCenter.current = viewRef.current.centerYear
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const v = viewRef.current
    const DOT_Y = 340 - 56 - 28

    if (dragging.current) {
      const dx = e.clientX - dragStartX.current
      const newCenter = dragStartCenter.current - dx / v.pxPerYear
      const next = { ...v, centerYear: newCenter }
      viewRef.current = next
      setView(next)
      setTooltip(null)
      return
    }

    // Hover detection
    const hovYear = xToYear(mouseX, v, canvasSize.w)
    const pxThreshold = Math.max(8, 5 / v.pxPerYear)
    const hit = visibleBattles.find(b => {
      const bx = yearToX(b.numYear, v, canvasSize.w)
      const dy = Math.abs(e.clientY - rect.top - DOT_Y)
      return Math.abs(bx - mouseX) < pxThreshold && dy < 20
    }) ?? null

    if (hit) {
      setTooltip({ battle: hit, x: mouseX, y: DOT_Y - 14 })
    } else {
      setTooltip(null)
    }
  }, [canvasSize.w, visibleBattles])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return
    const moved = Math.abs(e.clientX - dragStartX.current) > 4
    dragging.current = false
    if (!moved && tooltip) setSelected(tooltip.battle)
  }, [tooltip])

  const onMouseLeave = useCallback(() => {
    dragging.current = false
    setTooltip(null)
  }, [])

  // ── Click on canvas ───────────────────────────────────────
  const onClick = useCallback((e: React.MouseEvent) => {
    if (Math.abs(e.clientX - dragStartX.current) > 4) return
    if (tooltip) setSelected(tooltip.battle)
  }, [tooltip])

  // ── Zoom controls ─────────────────────────────────────────
  const zoomIn = () => {
    const v = viewRef.current
    const next = { ...v, pxPerYear: Math.min(MAX_PX_PER_YEAR, v.pxPerYear * 1.6) }
    viewRef.current = next; setView(next)
  }
  const zoomOut = () => {
    const v = viewRef.current
    const next = { ...v, pxPerYear: Math.max(MIN_PX_PER_YEAR, v.pxPerYear / 1.6) }
    viewRef.current = next; setView(next)
  }
  const resetView = () => { viewRef.current = DEFAULT_VIEW; setView(DEFAULT_VIEW) }
  const fitAll = () => {
    const years = parsedBattles.current.map(b => b.numYear)
    const minY = Math.min(...years), maxY = Math.max(...years)
    const range = maxY - minY
    const pxPerYear = Math.max(MIN_PX_PER_YEAR, (canvasSize.w - 80) / range)
    const next = { centerYear: (minY + maxY) / 2, pxPerYear }
    viewRef.current = next; setView(next)
  }
  const jumpToEra = (band: EraBand) => {
    const range = band.end - band.start
    const pxPerYear = Math.max(MIN_PX_PER_YEAR, (canvasSize.w - 120) / range)
    const next = { centerYear: (band.start + band.end) / 2, pxPerYear }
    viewRef.current = next; setView(next)
  }

  // ── Era filter toggle ─────────────────────────────────────
  const toggleEra = (id: EraId) => {
    setActiveEras(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const visibleCount = visibleBattles.filter(b => {
    const x = yearToX(b.numYear, view, canvasSize.w)
    return x >= 0 && x <= canvasSize.w
  }).length

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <div className="border-b border-gold/20 bg-slate/50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="eyebrow mb-1">{isES ? 'Cartografía Temporal' : 'Temporal Cartography'}</p>
            <h1 className="font-cinzel text-gold text-2xl font-bold">
              {isES ? 'Línea del Tiempo Global' : 'Global Military Timeline'}
            </h1>
            <p className="text-smoke text-sm mt-1">
              {isES
                ? `${battles.length.toLocaleString('es')} batallas · 50.000 años de historia militar · Rueda del ratón para zoom · Arrastra para desplazar`
                : `${battles.length.toLocaleString('en')} battles · 50,000 years of military history · Scroll to zoom · Drag to pan`}
            </p>
          </div>
          {/* Zoom controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={zoomIn}  className="w-8 h-8 border border-gold/30 text-gold hover:bg-gold/10 transition-colors font-cinzel font-bold flex items-center justify-center">+</button>
            <button onClick={zoomOut} className="w-8 h-8 border border-gold/30 text-gold hover:bg-gold/10 transition-colors font-cinzel font-bold flex items-center justify-center">−</button>
            <button onClick={resetView} className="font-cinzel text-[0.55rem] tracking-widest uppercase border border-gold/25 text-smoke hover:text-gold px-3 py-1.5 transition-colors">
              {isES ? 'Reset' : 'Reset'}
            </button>
            <button onClick={fitAll} className="font-cinzel text-[0.55rem] tracking-widest uppercase border border-gold/25 text-smoke hover:text-gold px-3 py-1.5 transition-colors">
              {isES ? 'Ver todo' : 'Fit all'}
            </button>
            <div className="font-cinzel text-[0.5rem] tracking-wider text-smoke border border-gold/15 px-2 py-1">
              {isES ? `${visibleCount} visibles` : `${visibleCount} visible`}
            </div>
          </div>
        </div>
      </div>

      {/* Era filter pills */}
      <div className="border-b border-gold/10 bg-ink px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveEras(new Set())}
            className={`font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-3 py-1.5 border transition-all ${
              activeEras.size === 0
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/20 text-smoke hover:text-mist hover:border-gold/40'
            }`}
          >
            {isES ? 'Todas' : 'All'}
          </button>
          {ERA_BANDS.map(band => (
            <button
              key={band.id}
              onClick={() => { toggleEra(band.id); jumpToEra(band) }}
              className={`font-cinzel text-[0.55rem] tracking-[0.15em] uppercase px-3 py-1.5 border transition-all whitespace-nowrap ${
                activeEras.has(band.id)
                  ? 'border-gold/60 bg-gold/10 text-gold'
                  : 'border-gold/15 text-smoke hover:text-mist hover:border-gold/35'
              }`}
              style={{ borderColor: activeEras.has(band.id) ? band.dotColor : undefined, color: activeEras.has(band.id) ? band.dotColor : undefined }}
            >
              {isES ? band.nameEs : band.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 relative select-none overflow-hidden" style={{ minHeight: 340 }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="block w-full"
          style={{ cursor: dragging.current ? 'grabbing' : 'grab', touchAction: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        />

        {/* Tooltip */}
        {tooltip && !dragging.current && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: Math.min(tooltip.x + 10, canvasSize.w - 240),
              top: tooltip.y - 70,
            }}
          >
            <div className="bg-ink border border-gold/40 px-3 py-2 shadow-xl" style={{ minWidth: 200, maxWidth: 240 }}>
              <div className="font-cinzel text-[0.5rem] tracking-[0.15em] text-smoke uppercase mb-0.5">
                {translateYear(lang, tooltip.battle.year)}
              </div>
              <div className="font-cinzel text-gold text-[0.7rem] font-bold leading-snug mb-1">
                {tooltip.battle.name}
              </div>
              <div className="font-crimson text-smoke text-[0.72rem] leading-tight">
                {translateCombatants(lang, tooltip.battle.combatants)}
              </div>
            </div>
          </div>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-4 font-cinzel text-[0.5rem] tracking-wider text-smoke/40 uppercase select-none pointer-events-none">
          {isES ? 'Rueda: zoom · Arrastrar: desplazar · Clic: detalle' : 'Scroll: zoom · Drag: pan · Click: detail'}
        </div>
      </div>

      {/* Selected battle detail panel */}
      {selected && (
        <div className="border-t border-gold/20 bg-slate/60 px-6 py-5">
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="font-cinzel text-[0.5rem] tracking-[0.2em] text-smoke uppercase mb-1">
                {translateYear(lang, selected.year)} · {getEraName(lang, selected.eraId, selected.eraName)}
              </div>
              <h2 className="font-playfair font-bold text-cream text-xl mb-1">{selected.name}</h2>
              <p className="font-crimson italic text-smoke mb-2">{translateCombatants(lang, selected.combatants)}</p>
              {selected.desc && (
                <p className="font-crimson text-smoke text-sm leading-relaxed max-w-2xl">{selected.desc}</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 pt-1">
              <Link
                href={`/${lang}/batallas/${slugify(selected.name)}`}
                className="btn-primary text-sm"
              >
                {isES ? 'Ver análisis →' : 'See analysis →'}
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="font-cinzel text-[0.55rem] tracking-widest uppercase text-smoke hover:text-gold transition-colors border border-gold/20 px-3 py-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Era legend row */}
      <div className="border-t border-gold/10 bg-ink/80 px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          {ERA_BANDS.map(band => (
            <div key={band.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: band.dotColor }}
              />
              <span className="font-cinzel text-[0.5rem] tracking-wider text-smoke uppercase whitespace-nowrap">
                {isES ? band.nameEs : band.nameEn}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
