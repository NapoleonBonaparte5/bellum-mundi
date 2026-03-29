// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — LIBRARY PAGE
// Historical documents and treaties
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllDocs } from '@/lib/data/helpers'

export const revalidate = 3600
import { ERAS } from '@/lib/data/eras'
import { LibraryClient } from '@/components/library/LibraryClient'

interface LibraryPageProps {
  params: Promise<{ lang: string }>
}

const BASE = 'https://bellummundi.com'

export async function generateMetadata({ params }: LibraryPageProps): Promise<Metadata> {
  const { lang } = await params
  const isEN = lang === 'en'
  return {
    title: isEN ? 'Military Library' : 'Biblioteca Militar',
    description: isEN
      ? 'Historical documents, treaties, and works that changed military history.'
      : 'Documentos históricos, tratados y obras que cambiaron la historia militar.',
    alternates: {
      canonical: `${BASE}/${lang}/biblioteca`,
      languages: {
        es: `${BASE}/es/biblioteca`,
        en: `${BASE}/en/biblioteca`,
        'x-default': `${BASE}/es/biblioteca`,
      },
    },
  }
}

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { lang } = await params
  const l = lang as Lang
  const isEN = l === 'en'

  const docs = getAllDocs()
  const eraIds = ERAS.map(e => ({ id: e.id, name: e.name }))

  return (
    <div className="px-4 md:px-8 pt-8 pb-4 max-w-content mx-auto">
      <div className="epic-header-wrap">
      <div className="index-header" style={{ width:'100%', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="eyebrow mb-3 w-full text-center">{isEN ? 'Military Encyclopedia' : 'Enciclopedia Militar'}</div>
        <h1 className="font-playfair font-bold text-cream mb-4 w-full text-center" style={{ fontSize: 'clamp(2.2rem,6vw,4rem)' }}>
          📜 {isEN ? 'Military Library' : 'Biblioteca Militar'}
        </h1>
        <p className="font-crimson italic text-mist text-xl max-w-2xl mb-6 text-center mx-auto">
          {isEN
            ? 'Treaties, works and historical documents that defined warfare'
            : 'Tratados, obras y documentos históricos que definieron la guerra'
          }
        </p>
        <div className="gold-divider mx-auto" />
      </div>
      </div>
      <LibraryClient docs={docs} eras={eraIds} lang={l} />
    </div>
  )
}
