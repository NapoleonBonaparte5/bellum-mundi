'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LEAFLET MAP (6C)
// Enriched popups + onZoomChange callback
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface LeafletMapProps {
  battles: FlatBattle[]
  lang: Lang
  eraColors: Record<string, string>
  onSelect: (battle: FlatBattle) => void
  onZoomChange?: (zoom: number) => void
}

// Era label mapping for badges
const ERA_LABELS_ES: Record<string, string> = {
  prehistoric: 'Prehistórico', ancient: 'Antigüedad', classical: 'Clásico',
  medieval: 'Medieval', early_modern: 'Moderna', napoleon: 'Napoleónico',
  ww1: 'I GM', ww2: 'II GM', cold_war: 'Guerra Fría', contemporary: 'Contemporáneo',
}
const ERA_LABELS_EN: Record<string, string> = {
  prehistoric: 'Prehistoric', ancient: 'Antiquity', classical: 'Classical',
  medieval: 'Medieval', early_modern: 'Early Modern', napoleon: 'Napoleonic',
  ww1: 'WWI', ww2: 'WWII', cold_war: 'Cold War', contemporary: 'Contemporary',
}

export default function LeafletMap({ battles, lang, eraColors, onSelect, onZoomChange }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const isES = lang === 'es'

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [30, 15],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    // Zoom change callback (6A)
    if (onZoomChange) {
      map.on('zoomend', () => onZoomChange(map.getZoom()))
    }

    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when battles change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    battles.forEach((battle, idx) => {
      if (battle.lat === undefined || battle.lng === undefined) return

      const color = eraColors[battle.eraId] ?? '#C9A84C'
      const delay = idx * 10

      const icon = L.divIcon({
        html: `<div class="map-marker-dot" style="
          width:10px;height:10px;border-radius:50%;
          background:${color};
          border:1px solid rgba(255,255,255,0.4);
          box-shadow:0 0 6px ${color}88;
          animation: markerSpring 400ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both;
        "></div>`,
        className: '',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })

      // Era badge color
      const eraLabel = isES
        ? (ERA_LABELS_ES[battle.eraId] ?? battle.eraName)
        : (ERA_LABELS_EN[battle.eraId] ?? battle.eraName)

      // Enriched popup (6C)
      const descSnippet = battle.desc ? battle.desc.slice(0, 80) + (battle.desc.length > 80 ? '…' : '') : ''
      const detailUrl = `/${lang}/batallas/${battle.slug}`

      const popupHTML = `
        <div style="font-family:Georgia,serif;min-width:220px;max-width:280px">
          <!-- Era badge -->
          <div style="display:inline-block;font-size:0.48rem;font-family:sans-serif;letter-spacing:0.12em;text-transform:uppercase;padding:2px 7px;background:${color}22;border:1px solid ${color}55;color:${color};margin-bottom:8px;border-radius:1px">${eraLabel}</div>
          <!-- Year -->
          <div style="font-size:0.58rem;font-family:sans-serif;color:#C9A84C;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:5px;font-weight:700">${battle.year}</div>
          <!-- Name -->
          <div style="font-weight:700;color:#F9F5ED;font-size:1rem;line-height:1.25;margin-bottom:5px">${battle.name}</div>
          <!-- Combatants -->
          <div style="color:#9B9590;font-size:0.8rem;margin-bottom:${descSnippet ? '6px' : '0'};font-style:italic">${battle.combatants}</div>
          ${descSnippet ? `<div style="color:#9B9590;font-size:0.78rem;line-height:1.45;margin-bottom:8px">${descSnippet}</div>` : ''}
          <!-- Detail link -->
          <a href="${detailUrl}" style="display:inline-block;font-size:0.5rem;font-family:sans-serif;letter-spacing:0.15em;text-transform:uppercase;padding:5px 10px;background:rgba(139,26,26,0.2);border:1px solid rgba(139,26,26,0.4);color:#E07070;text-decoration:none;margin-top:4px;transition:background 0.15s" onmouseover="this.style.background='rgba(139,26,26,0.35)'" onmouseout="this.style.background='rgba(139,26,26,0.2)'">
            📍 ${isES ? 'Ver en detalle' : 'View detail'}
          </a>
        </div>
      `

      const marker = L.marker([battle.lat, battle.lng], { icon })
        .bindPopup(popupHTML, {
          className: 'bm-popup',
          maxWidth: 300,
        })
        .on('click', () => onSelect(battle))

      markersRef.current!.addLayer(marker)
    })
  }, [battles, eraColors, onSelect, isES, lang])

  return (
    <div
      ref={containerRef}
      className="w-full map-mobile-height"
      style={{ height: 600 }}
      aria-label={isES ? 'Mapa mundial de batallas' : 'World battle map'}
    />
  )
}
