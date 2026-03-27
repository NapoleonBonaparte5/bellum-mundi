// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — GET IMAGES API
// GET /api/get-images?terms=term1|term2|term3
// Fetches Wikipedia thumbnail images for given search terms
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'

interface WikiImage {
  url: string
  title: string
}

export async function GET(req: NextRequest) {
  const termsParam = req.nextUrl.searchParams.get('terms')
  if (!termsParam) {
    return NextResponse.json({ error: 'terms parameter required' }, { status: 400 })
  }

  const terms = termsParam.split('|').map(t => t.trim()).filter(Boolean).slice(0, 3)
  const images: WikiImage[] = []

  for (const term of terms) {
    try {
      const apiUrl = new URL('https://en.wikipedia.org/w/api.php')
      apiUrl.searchParams.set('action', 'query')
      apiUrl.searchParams.set('titles', term)
      apiUrl.searchParams.set('prop', 'pageimages')
      apiUrl.searchParams.set('format', 'json')
      apiUrl.searchParams.set('pithumbsize', '500')
      apiUrl.searchParams.set('pilimit', '1')
      apiUrl.searchParams.set('origin', '*')

      const res = await fetch(apiUrl.toString(), {
        headers: { 'User-Agent': 'BellumMundi/2.0 (https://bellummundi.com)' },
        next: { revalidate: 86400 }, // cache 24h
      })

      if (!res.ok) continue

      const data = await res.json()
      const pages = data?.query?.pages
      if (!pages) continue

      const page = Object.values(pages)[0] as any
      if (page?.thumbnail?.source) {
        images.push({ url: page.thumbnail.source, title: page.title ?? term })
      }
    } catch {
      // Silent — image is optional
    }
  }

  return NextResponse.json({ images })
}
