'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — CHIP SCROLLER
// Horizontal scrollable chip row with arrow navigation
// ═══════════════════════════════════════════════════════════

import { useRef } from 'react'

interface ChipScrollerProps {
  children: React.ReactNode
  className?: string
}

export function ChipScroller({ children, className = '' }: ChipScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' })
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => scroll('left')}
        className="flex-shrink-0 w-6 h-7 flex items-center justify-center text-smoke hover:text-gold transition-colors font-cinzel text-base leading-none select-none"
        aria-label="Scroll left"
        tabIndex={-1}
      >‹</button>
      <div ref={scrollRef} className="chips-scroll flex-1">
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="flex-shrink-0 w-6 h-7 flex items-center justify-center text-smoke hover:text-gold transition-colors font-cinzel text-base leading-none select-none"
        aria-label="Scroll right"
        tabIndex={-1}
      >›</button>
    </div>
  )
}
