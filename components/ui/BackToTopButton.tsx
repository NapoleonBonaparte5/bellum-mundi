'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — BACK TO TOP BUTTON
// Fixed circle button, appears after 600px scroll
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'

export function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
      setVisible(pct >= 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top${visible ? ' visible' : ''}`}
      aria-label="Back to top"
    >
      <span className="btt-icon">⚔</span>
    </button>
  )
}
