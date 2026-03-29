'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — GLOBAL TIMELINE WRAPPER
// Client Component boundary: dynamic(ssr:false) must live here,
// not in the Server Component page. Pattern required by Next.js 15+.
// ═══════════════════════════════════════════════════════════

import dynamic from 'next/dynamic'
import type { FlatBattle, Lang } from '@/lib/data/types'

const GlobalTimeline = dynamic(
  () => import('./GlobalTimeline').then(m => m.GlobalTimeline),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[60vh] bg-slate flex items-center justify-center">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    ),
  }
)

interface GlobalTimelineWrapperProps {
  battles: FlatBattle[]
  lang: Lang
}

export function GlobalTimelineWrapper({ battles, lang }: GlobalTimelineWrapperProps) {
  return <GlobalTimeline battles={battles} lang={lang} />
}
