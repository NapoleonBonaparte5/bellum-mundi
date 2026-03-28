// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — DEFAULT OG IMAGE (app-level)
// Generated with Next.js ImageResponse
// ═══════════════════════════════════════════════════════════

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Bellum Mundi — Historia Militar Universal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0806',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Gold border frame */}
        <div style={{
          position: 'absolute',
          inset: 24,
          border: '1px solid rgba(201,168,76,0.4)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          inset: 30,
          border: '1px solid rgba(201,168,76,0.15)',
          display: 'flex',
        }} />

        {/* Ornament top */}
        <div style={{
          fontSize: 14,
          letterSpacing: '0.4em',
          color: 'rgba(201,168,76,0.7)',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Encyclopaedia Militaris Universalis
        </div>

        {/* Main title */}
        <div style={{
          fontSize: 88,
          fontWeight: 900,
          color: '#F9F5ED',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}>
          BELLUM MUNDI
        </div>

        {/* Gold rule */}
        <div style={{
          width: 120,
          height: 1,
          background: 'rgba(201,168,76,0.6)',
          marginBottom: 20,
        }} />

        {/* Subtitle */}
        <div style={{
          fontSize: 22,
          color: 'rgba(201,168,76,0.8)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Historia Militar Universal
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 48,
          marginTop: 40,
          fontSize: 14,
          color: '#9B9590',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          <span>890+ Batallas</span>
          <span>·</span>
          <span>244 Comandantes</span>
          <span>·</span>
          <span>200+ Civilizaciones</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
