// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ERA TRANSLATIONS
// Small enough to be fully inline here.
// ═══════════════════════════════════════════════════════════

import type { SupportedLang } from '../types'
import type { EraId } from '../../data/types'

// Era display names — add new language column for each new lang
export const ERA_NAMES: Record<EraId, Record<SupportedLang, string>> = {
  prehistoric: { es: 'Prehistoria',      en: 'Prehistoric' },
  ancient:     { es: 'Antigüedad',       en: 'Antiquity' },
  classical:   { es: 'Era Clásica',      en: 'Classical Era' },
  medieval:    { es: 'Edad Media',       en: 'Middle Ages' },
  early_modern:{ es: 'Edad Moderna',     en: 'Early Modern' },
  napoleon:    { es: 'Era Napoleónica',  en: 'Napoleonic Era' },
  ww1:         { es: 'Primera Guerra',   en: 'World War I' },
  ww2:         { es: 'Segunda Guerra',   en: 'World War II' },
  cold_war:    { es: 'Guerra Fría',      en: 'Cold War' },
  contemporary:{ es: 'Contemporáneo',   en: 'Contemporary' },
}

// Era overviews — full paragraph per language
export const ERA_OVERVIEWS: Record<EraId, Partial<Record<SupportedLang, string>>> = {
  prehistoric: {
    en: 'The first human conflicts arise before writing. Paleolithic tribes fight for resources and survival. The development of the first weapons forever transforms the nature of combat. Neolithic city-states establish the foundations of organized warfare.',
  },
  ancient: {
    en: "The invention of writing allows wars to be recorded for the first time. The great empires of Mesopotamia, Egypt, Assyria, Persia, Greece and China create professional armies. The Macedonian sarissa, Egyptian war chariots, Assyrian archers and Sun Tzu's Chinese strategy define ancient warfare.",
  },
  classical: {
    en: "Rome builds the most efficient army in Western history. Its legions conquer the known world with discipline, engineering and unprecedented logistics. The Parthian Empire holds in the East. China lives the Three Kingdoms era. The Huns emerge as the terror of the steppes.",
  },
  medieval: {
    en: 'The armored knight dominates Europe while Islamic armies expand the caliphate from Arabia to Spain. The Crusades clash civilizations. The Vikings terrorize the known world. The Mongol Empire sweeps Asia. Chinese gunpowder arrives in the West and changes everything.',
  },
  early_modern: {
    en: 'Gunpowder irreversibly transforms warfare. The Spanish Tercios dominate Europe for 150 years. The Ottoman Empire reaches its zenith. The conquest of the New World redefines the world. The Thirty Years War sows the seeds of the modern nation-state.',
  },
  napoleon: {
    en: 'Napoleon Bonaparte creates the modern army based on merit, mobility and tactical initiative. His battles are studied today in military academies worldwide. The corps system and mobile artillery revolutionize strategy. Waterloo marks the end of an era.',
  },
  ww1: {
    en: 'The Great War redefines industrial horror. The trenches of the Western Front turn Europe into a cemetery. Ten million soldiers dead. Gas, tanks and aircraft debut. Four empires fall: German, Austro-Hungarian, Russian and Ottoman.',
  },
  ww2: {
    en: 'The greatest conflict in human history: 70–85 million dead. Blitzkrieg conquers Western Europe in weeks. The USSR resists with unimaginable losses. The Pacific sees the greatest naval combat in history. Atomic bombs inaugurate the nuclear era.',
  },
  cold_war: {
    en: 'Two nuclear superpowers in permanent tension redefine global geopolitics. Proxy wars in Korea, Vietnam, Angola and Afghanistan. Nuclear deterrence maintains peace between great powers but fuels dozens of peripheral conflicts. The Berlin Wall falls.',
  },
  contemporary: {
    en: 'High-technology warfare: drones, precision missiles, cyberweapons and artificial intelligence. 21st century conflicts mix conventional wars, insurgencies and hybrid warfare. Ukraine and Gaza define the combat of the future.',
  },
}

export function getEraName(lang: SupportedLang, eraId: EraId, fallback: string): string {
  return ERA_NAMES[eraId]?.[lang] ?? fallback
}

export function getEraOverview(lang: SupportedLang, eraId: EraId, spanishOverview: string): string {
  if (lang === 'es') return spanishOverview
  return ERA_OVERVIEWS[eraId]?.[lang] ?? spanishOverview
}
