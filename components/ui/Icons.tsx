// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — SVG MILITARY ICON LIBRARY (B1)
// Inline SVG icons — consistent across all platforms
// All icons: currentColor, size prop, aria-hidden="true"
// ═══════════════════════════════════════════════════════════

interface IconProps {
  size?: number
  className?: string
}

export function IconSword({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14.5 2.5L21.5 9.5l-10 10-3.5-1-1-3.5z" />
      <path d="M2.5 21.5l4-4" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  )
}

export function IconCrown({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 17l3-10 4.5 6.5L12 4l2.5 9.5L19 7l3 10H2z" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

export function IconMap({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}

export function IconScroll({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2H6z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}

export function IconShield({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function IconColumns({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 7L12 3l10 4" />
      <line x1="2" y1="7" x2="22" y2="7" />
      <line x1="2" y1="21" x2="22" y2="21" />
      <line x1="5" y1="7" x2="5" y2="21" />
      <line x1="10" y1="7" x2="10" y2="21" />
      <line x1="14" y1="7" x2="14" y2="21" />
      <line x1="19" y1="7" x2="19" y2="21" />
    </svg>
  )
}

export function IconDagger({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M19 5L5 19" />
      <path d="M19 5L22 2" />
      <path d="M15 9L19 5" />
      <path d="M5 19L2 22l4-1 4-4" />
      <line x1="11" y1="13" x2="13" y2="11" />
    </svg>
  )
}

export function IconChat({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconMuseum({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 9L12 4l9 5" />
      <rect x="3" y="9" width="18" height="2" rx="0" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="6" y1="11" x2="6" y2="21" />
      <line x1="10" y1="11" x2="10" y2="21" />
      <line x1="14" y1="11" x2="14" y2="21" />
      <line x1="18" y1="11" x2="18" y2="21" />
    </svg>
  )
}

export function IconTimeline({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="11" width="20" height="2" rx="1" fill="currentColor" />
      <circle cx="6" cy="12" r="2.5" fill="currentColor" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="18" cy="12" r="2.5" fill="currentColor" />
    </svg>
  )
}

export function IconGraduate({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 22 8 12 14 2 8 12 2" />
      <path d="M6 11v5l6 3 6-3v-5" />
      <line x1="22" y1="8" x2="22" y2="14" />
    </svg>
  )
}

export function IconStar({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconStarFilled({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconCrossedSwords({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
      <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" />
      <path d="M3.5 7V3.5H7" />
      <path d="M17 3.5h3.5V7" />
      <path d="M3.5 17v3.5H7" />
      <path d="M17 20.5h3.5V17" />
    </svg>
  )
}

export function IconChevronDown({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
