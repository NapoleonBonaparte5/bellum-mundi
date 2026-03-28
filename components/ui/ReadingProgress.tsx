'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — READING PROGRESS BAR
// Gold 2px top line, scroll-based width
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) { setProgress(0); return }
      setProgress(Math.min(100, (scrollTop / docHeight) * 100))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="reading-progress-bar"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  )
}
