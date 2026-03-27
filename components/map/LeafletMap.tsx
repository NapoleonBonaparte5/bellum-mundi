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

  // Update markers when battles change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return

    markersRef.current.clearLayers()

    battles.forEach(battle => {
      if (battle.lat === undefined || battle.lng === undefined) return

      const color = eraColors[battle.eraId] ?? '#C9A84C'
      const icon = L.divIcon({
        html: `<div style="
          width:10px;height:10px;border-radius:50%;
          background:${color};
          border:1px solid rgba(255,255,255,0.4);
          box-shadow:0 0 6px ${color}88;
        "></div>`,
        className: '',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      })

      const marker = L.marker([battle.lat, battle.lng], { icon })
        .bindPopup(`
          <div style="font-family:serif;min-width:160px">
            <div style="font-size:0.65rem;color:#9B9590;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">${battle.year}</div>
            <div style="font-weight:bold;color:#F9F5ED;font-size:1rem;line-height:1.2">${battle.name}</div>
            <div style="color:#9B9590;font-size:0.85rem;margin-top:4px">${battle.combatants}</div>
          </div>
        `, {
          className: 'bm-popup',
          maxWidth: 260,
        })
        .on('click', () => onSelect(battle))

      markersRef.current!.addLayer(marker)
    })
  }, [battles, eraColors, onSelect])

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: 600 }}
      aria-label={lang === 'en' ? 'World battle map' : 'Mapa mundial de batallas'}
    />
  )
}
