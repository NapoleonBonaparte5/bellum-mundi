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
        disallow: ['/api/', '/success', '/_next/', '/museo'],
      },
    ],
    sitemap: 'https://bellummundi.com/sitemap.xml',
    host: 'https://bellummundi.com',
  }
}
