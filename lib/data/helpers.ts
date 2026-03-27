// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — DATA HELPERS
// ═══════════════════════════════════════════════════════════

import type { Era, EraId, FlatBattle, FlatCommander, FlatCivilization, FlatDoc } from './types'
import { ERAS } from './eras'

// ── SLUG ───────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── FLATTEN ALL BATTLES ────────────────────────────────────
export function getAllBattles(): FlatBattle[] {
  const result: FlatBattle[] = []
  for (const era of ERAS) {
    for (const b of era.battles_data) {
      result.push({
        ...b,
        eraId: era.id,
        eraName: era.name,
        slug: slugify(b.name),
      })
    }
  }
  return result
}

// ── FLATTEN ALL COMMANDERS ─────────────────────────────────
export function getAllCommanders(): FlatCommander[] {
  const result: FlatCommander[] = []
  for (const era of ERAS) {
    for (const c of era.commanders) {
      result.push({
        ...c,
        eraId: era.id,
        eraName: era.name,
        slug: slugify(c.name),
      })
    }
  }
  return result
}

// ── FLATTEN ALL CIVS ───────────────────────────────────────
export function getAllCivs(): FlatCivilization[] {
  const result: FlatCivilization[] = []
  for (const era of ERAS) {
    for (const c of era.civs) {
      result.push({ ...c, eraId: era.id, eraName: era.name })
    }
  }
  return result
}

// ── FLATTEN ALL DOCS ───────────────────────────────────────
const DOC_CATEGORIES: Record<string, 'tratado' | 'obra' | 'documento' | 'carta'> = {
  '📜': 'tratado', '📚': 'obra', '📋': 'documento', '✉️': 'carta',
  '⚖️': 'documento', '🌍': 'documento', '🕊️': 'tratado', '📖': 'obra',
  '🗺️': 'obra', '🌐': 'tratado', '☢️': 'tratado', '✡️': 'carta',
  '🏥': 'tratado', '⚔️': 'obra', '🏛️': 'obra', '✝️': 'obra',
  '📨': 'documento', '⛵': 'documento', '🦅': 'documento',
  '🖼️': 'documento', '☠️': 'tratado',
}

export function getAllDocs(): FlatDoc[] {
  const result: FlatDoc[] = []
  for (const era of ERAS) {
    for (const d of era.docs) {
      result.push({
        ...d,
        eraId: era.id,
        eraName: era.name,
        category: DOC_CATEGORIES[d.icon] ?? 'documento',
      })
    }
  }
  return result
}

// ── GET ERA BY ID ─────────────────────────────────────────
export function getEraById(id: EraId): Era | undefined {
  return ERAS.find(e => e.id === id)
}

// ── GET BATTLE BY SLUG ────────────────────────────────────
export function getBattleBySlug(slug: string): { battle: FlatBattle; era: Era } | null {
  for (const era of ERAS) {
    for (const b of era.battles_data) {
      if (slugify(b.name) === slug) {
        return { battle: { ...b, eraId: era.id, eraName: era.name, slug }, era }
      }
    }
  }
  return null
}

// ── GET COMMANDER BY SLUG ─────────────────────────────────
export function getCommanderBySlug(slug: string): { commander: FlatCommander; era: Era } | null {
  for (const era of ERAS) {
    for (const c of era.commanders) {
      if (slugify(c.name) === slug) {
        return { commander: { ...c, eraId: era.id, eraName: era.name, slug }, era }
      }
    }
  }
  return null
}

// ── ERA EMOJI MAP ─────────────────────────────────────────
export const ERA_EMOJIS: Record<EraId, string> = {
  prehistoric: '🦴',
  ancient: '🏛️',
  classical: '🦅',
  medieval: '⚔️',
  early_modern: '🔫',
  napoleon: '👑',
  ww1: '⛏️',
  ww2: '💥',
  cold_war: '☢️',
  contemporary: '🌐',
}

// ── ERA COLORS ────────────────────────────────────────────
export const ERA_COLORS: Record<EraId, string> = {
  prehistoric: '#9B8860',
  ancient: '#C9A84C',
  classical: '#E8C97A',
  medieval: '#8B6914',
  early_modern: '#C0392B',
  napoleon: '#3498db',
  ww1: '#95a5a6',
  ww2: '#e74c3c',
  cold_war: '#9b59b6',
  contemporary: '#27ae60',
}

// ── SEARCH (client-side fuzzy) ────────────────────────────
export interface SearchItem {
  type: 'battle' | 'commander' | 'civ' | 'doc' | 'weapon'
  icon: string
  name: string
  sub: string
  badge: string
  eraId: EraId
  eraName: string
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []
  for (const era of ERAS) {
    for (const b of era.battles_data) {
      items.push({ type: 'battle', icon: '⚔', name: b.name, sub: b.combatants, badge: era.name, eraId: era.id, eraName: era.name })
    }
    for (const c of era.commanders) {
      items.push({ type: 'commander', icon: '👑', name: c.name, sub: c.role, badge: era.name, eraId: era.id, eraName: era.name })
    }
    for (const c of era.civs) {
      items.push({ type: 'civ', icon: '🏛️', name: c.name, sub: c.period, badge: era.name, eraId: era.id, eraName: era.name })
    }
    for (const d of era.docs) {
      items.push({ type: 'doc', icon: d.icon || '📜', name: d.name, sub: d.year, badge: era.name, eraId: era.id, eraName: era.name })
    }
    for (const w of era.weapons) {
      items.push({ type: 'weapon', icon: w.icon || '🗡️', name: w.name, sub: w.period, badge: era.name, eraId: era.id, eraName: era.name })
    }
  }
  return items
}

// ── PARSE YEAR FOR SORTING ────────────────────────────────
export function parseYear(yearStr: string): number {
  const m = String(yearStr).match(/(-?\d+)/)
  if (!m) return 0
  const n = parseInt(m[1])
  const isBC = /a\.C\.|BC/.test(yearStr)
  return isBC ? -n : n
}
