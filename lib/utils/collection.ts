// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COLLECTION & GAMIFICATION UTILS (8A)
// Personal saved battles, visit tracking, streaks
// ═══════════════════════════════════════════════════════════

const SAVED_KEY   = 'bm_saved_battles'
const VISITED_KEY = 'bm_visited'
const STREAK_KEY  = 'bm_streak'

export function getSaved(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') } catch { return [] }
}

export function toggleSaved(slug: string): boolean {
  const saved = getSaved()
  const idx = saved.indexOf(slug)
  if (idx > -1) { saved.splice(idx, 1) } else { saved.push(slug) }
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  return idx === -1 // true = now saved
}

export function isSaved(slug: string): boolean {
  return getSaved().includes(slug)
}

export function trackVisit(slug: string) {
  if (typeof window === 'undefined') return
  try {
    const visited: string[] = JSON.parse(localStorage.getItem(VISITED_KEY) ?? '[]')
    if (!visited.includes(slug)) {
      visited.push(slug)
      localStorage.setItem(VISITED_KEY, JSON.stringify(visited))
    }
    // Update streak
    const today = new Date().toDateString()
    const streak: { last: string; count: number } = JSON.parse(
      localStorage.getItem(STREAK_KEY) ?? '{"last":"","count":0}'
    )
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (streak.last === yesterday)    { streak.count++ }
    else if (streak.last !== today)   { streak.count = 1 }
    streak.last = today
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
  } catch { /* silent */ }
}

export function getStreak(): number {
  if (typeof window === 'undefined') return 0
  try {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY) ?? '{"count":0}')
    return streak.count ?? 0
  } catch { return 0 }
}

export function getSavedCount(): number {
  return getSaved().length
}
