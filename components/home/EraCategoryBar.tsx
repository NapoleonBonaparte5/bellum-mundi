'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ERA CATEGORY BAR
// Horizontal scrollable era chips — NVIDIA-style category bar
// ═══════════════════════════════════════════════════════════

import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/data/types'
import { getEraName } from '@/lib/i18n'
import type { EraId } from '@/lib/data/types'

interface Era {
  id: string
  name: string
  emoji: string
  battles: number
  nameEN: string
}

const ERAS: Era[] = [
  { id:'prehistoric',  name:'Prehistórico',           nameEN:'Prehistoric',     emoji:'🏺', battles: 50  },
  { id:'ancient',      name:'Antigüedad',              nameEN:'Antiquity',       emoji:'⚔',  battles: 250 },
  { id:'classical',    name:'Era Clásica',             nameEN:'Classical',       emoji:'🏛',  battles: 250 },
  { id:'medieval',     name:'Edad Media',              nameEN:'Middle Ages',     emoji:'🗡',  battles: 250 },
  { id:'early_modern', name:'Edad Moderna',            nameEN:'Early Modern',    emoji:'🔫', battles: 250 },
  { id:'napoleon',     name:'Era Napoleónica',         nameEN:'Napoleonic',      emoji:'🪖', battles: 200 },
  { id:'ww1',          name:'Primera Guerra Mundial',  nameEN:'World War I',     emoji:'💣', battles: 200 },
  { id:'ww2',          name:'Segunda Guerra Mundial',  nameEN:'World War II',    emoji:'✈',  battles: 200 },
  { id:'cold_war',     name:'Guerra Fría',             nameEN:'Cold War',        emoji:'🚀', battles: 200 },
  { id:'contemporary', name:'Era Contemporánea',       nameEN:'Contemporary',    emoji:'🌍', battles: 150 },
]

interface EraCategoryBarProps {
  lang: Lang
}

export function EraCategoryBar({ lang }: EraCategoryBarProps) {
  const router = useRouter()
  const isES = lang === 'es'

  return (
    <div
      style={{
        background: 'var(--steel)',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      className="era-category-bar"
    >
      <div
        className="flex items-stretch"
        style={{ width: 'max-content', minWidth: '100%' }}
      >
        {/* Label */}
        <div
          className="flex items-center px-5 flex-shrink-0"
          style={{
            borderRight: '1px solid rgba(201,168,76,0.12)',
            fontFamily: 'var(--font-cinzel)',
            fontSize: '0.5rem',
            letterSpacing: '0.2em',
            color: 'var(--smoke)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {isES ? 'Explorar por Era' : 'Browse by Era'}
        </div>

        {/* Era items */}
        {ERAS.map((era, i) => (
          <button
            key={era.id}
            onClick={() => router.push(`/${lang}/batallas?era=${era.id}`)}
            className="era-cat-item flex flex-col items-center justify-center gap-1 px-5 py-4 flex-shrink-0 cursor-pointer"
            style={{
              borderRight: i < ERAS.length - 1 ? '1px solid rgba(201,168,76,0.08)' : 'none',
              background: 'transparent',
              transition: 'background 0.15s ease, border-bottom-color 0.15s ease',
              borderBottom: '2px solid transparent',
              minWidth: '120px',
            }}
            title={isES ? era.name : era.nameEN}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{era.emoji}</span>
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.52rem',
                letterSpacing: '0.12em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {isES ? era.name : era.nameEN}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.44rem',
                letterSpacing: '0.08em',
                color: 'rgba(201,168,76,0.5)',
              }}
            >
              {era.battles}+
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
