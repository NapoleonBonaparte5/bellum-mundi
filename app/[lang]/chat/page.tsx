// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — AI MILITARY HISTORY CHAT PAGE
// ═══════════════════════════════════════════════════════════

import type { Metadata } from 'next'
import type { Lang } from '@/lib/data/types'
import { ChatInterface } from '@/components/chat/ChatInterface'

interface ChatPageProps {
  params: Promise<{ lang: Lang }>
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { lang } = await params
  return {
    title: lang === 'en'
      ? 'Military History AI Chat — Bellum Mundi'
      : 'Chat de Historia Militar con IA — Bellum Mundi',
    description: lang === 'en'
      ? 'Ask anything about military history — battles, commanders, strategies, wars. Powered by AI.'
      : 'Pregunta sobre historia militar — batallas, comandantes, estrategias, guerras. Con IA.',
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { lang } = await params
  return <ChatInterface lang={lang} />
}
