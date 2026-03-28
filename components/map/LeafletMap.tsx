'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LEAFLET MAP (dynamic import only)
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import type { FlatBattle, Lang, EraId } from '@/lib/data/types'

// Leaflet CSS must be imported globally — done in globals.css via CDN override
// We import it here for the JS bundle
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface LeafletMapProps {
  battles: FlatBattle[]
  lang: Lang
  eraColors: Record<string, string>
  onSelect: (battle: FlatBattle) => void
}

export default function LeafletMap({ battles, lang, eraColors, onSelect }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

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

    mapRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update markers when battles change — with spring-scale stagger animation
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

      const marker = L.marker([battle.lat, battle.lng], { icon })
        .bindPopup(`
          <div style="font-family:Georgia,serif;min-width:180px">
            <div style="font-size:0.6rem;font-family:serif;color:#C9A84C;text-transform:uppercase;letter-spacing:0.18em;margin-bottom:6px;font-weight:bold">${battle.year}</div>
            <div style="font-weight:bold;color:#F9F5ED;font-size:1.05rem;line-height:1.25;margin-bottom:5px">${battle.name}</div>
            <div style="color:#9B9590;font-size:0.82rem;margin-bottom:${battle.tag ? '6px' : '0'}">${battle.combatants}</div>
            ${battle.tag ? `<div style="display:inline-block;font-size:0.5rem;letter-spacing:0.15em;text-transform:uppercase;padding:2px 6px;background:rgba(139,26,26,0.35);border:1px solid rgba(139,26,26,0.5);color:#E07070;">${battle.tag}</div>` : ''}
          </div>
        `, {
          className: 'bm-popup',
          maxWidth: 280,
        })
        .on('click', () => onSelect(battle))

      markersRef.current!.addLayer(marker)
    })
  }, [battles, eraColors, onSelect])

  return (
    <div
      ref={containerRef}
      className="w-full map-mobile-height"
      style={{ height: 600 }}
      aria-label={lang === 'en' ? 'World battle map' : 'Mapa mundial de batallas'}
    />
  )
}
