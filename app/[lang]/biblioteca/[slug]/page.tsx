// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — DOCUMENT DETAIL PAGE
// /es/biblioteca/[slug] · /en/biblioteca/[slug]
// ═══════════════════════════════════════════════════════════

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllDocs, getDocBySlug } from '@/lib/data/helpers'
import { DocDetailClient } from '@/components/library/DocDetailClient'

interface DocPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  const langs: Lang[] = ['es', 'en']
  return langs.flatMap(lang =>
    docs.map(d => ({ lang, slug: d.slug }))
  )
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const result = getDocBySlug(slug)
  if (!result) return {}
  const { doc, era } = result
  return {
    title: doc.name,
    description: `${era.name} · ${doc.year} — ${lang === 'en' ? 'Historical document analysis' : 'Análisis del documento histórico'}`,
    openGraph: { title: `${doc.name} — Bellum Mundi`, description: `${era.name} · ${doc.year}` },
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { lang, slug } = await params
  const l = lang as Lang

  const result = getDocBySlug(slug)
  if (!result) notFound()

  const { doc, era } = result
  return <DocDetailClient doc={doc} era={era} lang={l} />
}
