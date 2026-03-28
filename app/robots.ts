// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ROBOTS.TXT
// ═══════════════════════════════════════════════════════════

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/success', '/_next/'],
      },
    ],
    sitemap: 'https://bellummundi.com/sitemap.xml',
  }
}
