'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SCROLL REVEAL HOOK
// Intersection Observer for cinematic scroll animations
// ═══════════════════════════════════════════════════════════

import { useRef, useState, useEffect } from 'react'

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // fire once
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Stagger children variant — returns a ref and a function to get per-child style
export function useStaggerReveal(threshold = 0.05, stepMs = 60) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const getChildStyle = (index: number): React.CSSProperties => ({
    transitionDelay: isVisible ? `${index * stepMs}ms` : '0ms',
  })

  return { ref, isVisible, getChildStyle }
}
