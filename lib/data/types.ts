// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════

// ── SUPPORTED LANGUAGES ────────────────────────────────────
export type Lang = 'es' | 'en'

// ── ERA IDs ────────────────────────────────────────────────
export type EraId =
  | 'prehistoric'
  | 'ancient'
  | 'classical'
  | 'medieval'
  | 'early_modern'
  | 'napoleon'
  | 'ww1'
  | 'ww2'
  | 'cold_war'
  | 'contemporary'

// ── BATTLE ─────────────────────────────────────────────────
export interface Battle {
  year: string          // e.g. "216 a.C." or "Jun 1944"
  name: string          // Spanish name (canonical)
  combatants: string    // e.g. "Cartago vs Roma"
  tag: string           // e.g. "Guerras Púnicas"
  lat?: number
  lng?: number
  desc: string          // Short description (~100 chars)
  eraId?: EraId         // Populated when flattened
  eraName?: string      // Populated when flattened
  slug?: string         // URL-friendly name
}

// ── COMMANDER ──────────────────────────────────────────────
export interface Commander {
  name: string
  role: string
  emoji: string
  eraId?: EraId
  eraName?: string
  slug?: string
}

// ── WEAPON ─────────────────────────────────────────────────
export interface Weapon {
  name: string
  period: string
  icon: string
  eraId?: EraId
}

// ── CIVILIZATION ───────────────────────────────────────────
export interface Civilization {
  name: string
  period: string
  flag: string
  power: number         // 0-1 power rating
  eraId?: EraId
  eraName?: string
}

// ── TACTIC ─────────────────────────────────────────────────
export interface Tactic {
  name: string
  origin: string
  icon: string
  eraId?: EraId
}

// ── DOCUMENT / TREATY ──────────────────────────────────────
export interface HistoricalDoc {
  name: string
  year: string
  icon: string
  eraId?: EraId
  eraName?: string
  category?: 'tratado' | 'obra' | 'documento' | 'carta'
}

// ── QUOTE ──────────────────────────────────────────────────
export interface Quote {
  text: string
  attr: string
}

// ── ERA (full data object) ─────────────────────────────────
export interface Era {
  id: EraId
  name: string            // Spanish name
  years: string           // e.g. "50.000–3.000 a.C."
  battles: number         // Count
  duration: string        // Years as string for display
  civs_count: number
  cmds: number
  overview: string        // Spanish overview paragraph
  quote: Quote
  battles_data: Battle[]
  commanders: Commander[]
  weapons: Weapon[]
  civs: Civilization[]
  tactics: Tactic[]
  docs: HistoricalDoc[]
}

// ── FLAT STRUCTURES (for index pages) ──────────────────────
export interface FlatBattle extends Battle {
  eraId: EraId
  eraName: string
  slug: string
}

export interface FlatCommander extends Commander {
  eraId: EraId
  eraName: string
  slug: string
}

export interface FlatCivilization extends Civilization {
  eraId: EraId
  eraName: string
}

export interface FlatDoc extends HistoricalDoc {
  eraId: EraId
  eraName: string
  category: 'tratado' | 'obra' | 'documento' | 'carta'
}

// ── USER / AUTH ────────────────────────────────────────────
export interface BellumUser {
  id: string
  name: string
  email: string
  plan: 'free' | 'premium'
}

// ── AI RESPONSE ────────────────────────────────────────────
export interface AIResponse {
  content: string
  imageTerms?: string[]
}

// ── SEARCH RESULT ──────────────────────────────────────────
export type SearchResultType = 'battle' | 'commander' | 'civ' | 'doc' | 'weapon'

export interface SearchResult {
  type: SearchResultType
  icon: string
  name: string
  sub: string
  badge: string
  era: Era
  item: Battle | Commander | Civilization | HistoricalDoc | Weapon
}
