'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LANG SYNC
// Syncs the <html lang> attribute client-side for i18n SEO.
// The root layout sets a default; this corrects it per route.
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react'
import type { Lang } from '@/lib/data/types'

export function LangSync({ lang }: { lang: Lang }) {
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}
