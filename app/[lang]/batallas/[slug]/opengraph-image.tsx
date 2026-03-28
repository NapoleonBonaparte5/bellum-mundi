// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — PER-BATTLE DYNAMIC OG IMAGE
// /[lang]/batallas/[slug]/opengraph-image
// Uses Next.js ImageResponse — Edge runtime
// ═══════════════════════════════════════════════════════════

import { ImageResponse } from 'next/og'
import { getBattleBySlug } from '@/lib/data/helpers'
import type { Lang } from '@/lib/data/types'

export const runtime = 'edge'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { lang: string; slug: string }
}

export default function Image({ params }: Props) {
  const { lang, slug } = params
  const isEN = lang === 'en'

  const result = getBattleBySlug(slug)

  // Fallback OG image if battle not found
  if (!result) {
    return new ImageResponse(
      (
        <div style={{
          background: '#0A0806',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          color: '#F9F5ED',
          fontSize: 48,
        }}>
          Bellum Mundi
        </div>
      ),
      { ...size },
    )
  }

  const { battle, era } = result
  const label = isEN ? 'Battle Analysis' : 'Análisis de Batalla'
  const byLine = isEN ? 'bellummundi.com' : 'bellummundi.com'

  // Truncate long names for layout
  const battleName = battle.name.length > 45
    ? battle.name.slice(0, 42) + '…'
    : battle.name
  const combatants = battle.combatants.length > 60
    ? battle.combatants.slice(0, 57) + '…'
    : battle.combatants

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0806',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Dark crimson gradient top strip */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg,#7A0B0B,#C0392B,#7A0B0B)',
          display: 'flex',
        }} />

        {/* Gold border frame */}
        <div style={{
          position: 'absolute',
          inset: 24,
          border: '1px solid rgba(201,168,76,0.35)',
          display: 'flex',
        }} />

        {/* Content area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: '60px 72px',
        }}>
          {/* Top: logo + era */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{
              fontSize: 16,
              letterSpacing: '0.35em',
              color: 'rgba(201,168,76,0.75)',
              textTransform: 'uppercase',
            }}>
              BELLUM MUNDI
            </div>
            <div style={{
              fontSize: 13,
              letterSpacing: '0.2em',
              color: 'rgba(155,149,144,0.8)',
              textTransform: 'uppercase',
            }}>
              {era.name}
            </div>
          </div>

          {/* Middle: battle name */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* Year badge */}
            <div style={{
              fontSize: 14,
              letterSpacing: '0.3em',
              color: 'rgba(201,168,76,0.6)',
              textTransform: 'uppercase',
            }}>
              ⚔ {battle.year}
            </div>

            {/* Battle name */}
            <div style={{
              fontSize: battleName.length > 30 ? 56 : 72,
              fontWeight: 900,
              color: '#F9F5ED',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}>
              {battleName}
            </div>

            {/* Gold rule */}
            <div style={{
              width: 80,
              height: 2,
              background: 'rgba(201,168,76,0.5)',
              marginTop: 4,
              display: 'flex',
            }} />

            {/* Combatants */}
            <div style={{
              fontSize: 22,
              color: 'rgba(201,168,76,0.85)',
              letterSpacing: '0.05em',
              fontStyle: 'italic',
            }}>
              {combatants}
            </div>
          </div>

          {/* Bottom: label + site */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}>
            <div style={{
              fontSize: 13,
              letterSpacing: '0.25em',
              color: 'rgba(155,149,144,0.7)',
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
            <div style={{
              fontSize: 14,
              letterSpacing: '0.15em',
              color: 'rgba(201,168,76,0.5)',
            }}>
              {byLine}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
