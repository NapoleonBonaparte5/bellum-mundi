// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LIBRARY PAGE
// Historical documents and treaties
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllDocs } from '@/lib/data/helpers'
import { ERAS } from '@/lib/data/eras'
import { LibraryClient } from '@/components/library/LibraryClient'

interface LibraryPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: LibraryPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'Military Library' : 'Biblioteca Militar',
    description: isEN
      ? 'Historical documents, treaties, and works that changed military history.'
      : 'Documentos históricos, tratados y obras que cambiaron la historia militar.',
  }
}

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  const docs = getAllDocs()
  const eraIds = ERAS.map(e => ({ id: e.id, name: e.name }))

  return (
    <div className="px-8 py-8 max-w-content mx-auto">
      <div className="mb-8">
        <div className="eyebrow mb-2">{isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}</div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold text-cream mb-3">
          📜 {isEN ? 'Military Library' : 'Biblioteca Militar'}
        </h1>
        <p className="font-crimson italic text-smoke text-lg">
          {isEN
            ? 'Treaties, works and historical documents that defined warfare'
            : 'Tratados, obras y documentos históricos que definieron la guerra'
          }
        </p>
      </div>
      <LibraryClient docs={docs} eras={eraIds} lang={l} />
    </div>
  )
}
