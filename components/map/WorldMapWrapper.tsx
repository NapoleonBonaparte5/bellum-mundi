'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — WORLD MAP WRAPPER
// Client Component boundary: dynamic(ssr:false) must live here,
// not in the Server Component page. Pattern required by Next.js 15+.
// ═══════════════════════════════════════════════════════════

import dynamic from 'next/dynamic'
import type { FlatBattle, Lang } from '@/lib/data/types'

const WorldMapClient = dynamic(
  () => import('./WorldMapClient').then(m => m.WorldMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] md:h-[600px] bg-slate flex items-center justify-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    ),
  }
)

interface WorldMapWrapperProps {
  battles: FlatBattle[]
  lang: Lang
}

export function WorldMapWrapper({ battles, lang }: WorldMapWrapperProps) {
  return <WorldMapClient battles={battles} lang={lang} />
}
