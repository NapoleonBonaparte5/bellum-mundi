// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — EDUCATIONAL LESSON GENERATOR PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { getAllBattles } from '@/lib/data/helpers'
import { LessonGenerator } from '@/components/educacion/LessonGenerator'

interface PageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en'
      ? 'Military History Lesson Generator — Bellum Mundi'
      : 'Generador de Lecciones de Historia Militar — Bellum Mundi',
    description: lang === 'en'
      ? 'Generate lesson plans, quizzes, essays and timelines on any military history topic with AI.'
      : 'Genera planes de clase, cuestionarios, ensayos y líneas del tiempo sobre cualquier tema de historia militar con IA.',
  }
}

export default async function EducacionPage({ params }: PageProps) {
  const { lang } = await params
  // Pass a sample of real battles as quick-pick suggestions
  const battles = getAllBattles().slice(0, 80)
  return <LessonGenerator lang={lang} battles={battles} />
}
