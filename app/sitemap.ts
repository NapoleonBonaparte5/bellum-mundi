// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SITEMAP
// Auto-generated for all battles, commanders, civs, docs
// ═══════════════════════════════════════════════════════════

import type { MetadataRoute } from 'next'
import { getAllBattles, getAllCommanders, getAllCivs, getAllDocs } from '@/lib/data/helpers'

const BASE = 'https://bellummundi.com'
const LANGS = ['es', 'en'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const battles    = getAllBattles()
  const commanders = getAllCommanders()
  const civs       = getAllCivs()
  const docs       = getAllDocs()

  const now = new Date()

  const staticRoutes = [
    { path: '',               priority: 1.0,  freq: 'weekly'  },
    { path: '/batallas',      priority: 0.9,  freq: 'weekly'  },
    { path: '/comandantes',   priority: 0.8,  freq: 'weekly'  },
    { path: '/civilizaciones',priority: 0.7,  freq: 'monthly' },
    { path: '/biblioteca',    priority: 0.7,  freq: 'monthly' },
    { path: '/mapa',          priority: 0.6,  freq: 'monthly' },
    { path: '/chat',          priority: 0.7,  freq: 'weekly'  },
    { path: '/armamento',     priority: 0.7,  freq: 'weekly'  },
    { path: '/timeline',      priority: 0.6,  freq: 'monthly' },
    { path: '/educacion',     priority: 0.8,  freq: 'weekly'  },
  ] as const

  const staticUrls: MetadataRoute.Sitemap = LANGS.flatMap(lang =>
    staticRoutes.map(r => ({
      url:              `${BASE}/${lang}${r.path}`,
      lastModified:     now,
      changeFrequency:  r.freq,
      priority:         r.priority,
    }))
  )

  const battleUrls: MetadataRoute.Sitemap = battles.flatMap(b =>
    LANGS.map(lang => ({
      url:             `${BASE}/${lang}/batallas/${b.slug}`,
      lastModified:    now,
      changeFrequency: 'monthly' as const,
      priority:        0.7,
    }))
  )

  const commanderUrls: MetadataRoute.Sitemap = commanders.flatMap(c =>
    LANGS.map(lang => ({
      url:             `${BASE}/${lang}/comandantes/${c.slug}`,
      lastModified:    now,
      changeFrequency: 'monthly' as const,
      priority:        0.6,
    }))
  )

  const civUrls: MetadataRoute.Sitemap = civs.flatMap(c =>
    LANGS.map(lang => ({
      url:             `${BASE}/${lang}/civilizaciones/${c.slug}`,
      lastModified:    now,
      changeFrequency: 'monthly' as const,
      priority:        0.5,
    }))
  )

  const docUrls: MetadataRoute.Sitemap = docs.flatMap(d =>
    LANGS.map(lang => ({
      url:             `${BASE}/${lang}/biblioteca/${d.slug}`,
      lastModified:    now,
      changeFrequency: 'monthly' as const,
      priority:        0.5,
    }))
  )

  return [...staticUrls, ...battleUrls, ...commanderUrls, ...civUrls, ...docUrls]
}
