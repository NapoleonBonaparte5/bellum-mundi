// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — I18N ENTRY POINT (v2)
// Single import for ALL translation needs:
//
//   import { t, getBattleName, translateCombatants } from '@/lib/i18n'
//
// UI strings: dot-notation path → t(lang, 'pages.battles.title')
// Data names: helper functions  → getBattleName(lang, spanishName)
//
// ── HOW TO ADD A NEW LANGUAGE ──────────────────────────────
//  1. Add the code to SupportedLang in lib/i18n/types.ts
//  2. Create lib/i18n/locales/de.ts (copy en.ts structure)
//  3. Add it to LOCALES below
//  4. Extend data-translation dicts in data-translations/
//  Zero component changes required.
// ═══════════════════════════════════════════════════════════

import { es } from './locales/es'
import { en } from './locales/en'
import type { SupportedLang, Locale } from './types'

export type { SupportedLang, Locale }
export type { Lang } from '../data/types'  // backward compat alias

// ── LOCALE REGISTRY ───────────────────────────────────────
// Add new languages here:
const LOCALES: Record<SupportedLang, Locale> = { es, en }

// ── VARIABLE INTERPOLATION ────────────────────────────────
function applyVars(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
    str
  )
}

// ── MAIN T FUNCTION (dot-notation) ────────────────────────
// Usage: t(lang, 'pages.battles.title')
//        t(lang, 'home.hero.subtitle')
//        t(lang, 'common.freeQueries', { n: 3 })
export function t(
  lang: SupportedLang,
  path: string,
  vars?: Record<string, string | number>
): string {
  const locale: Locale = LOCALES[lang] ?? LOCALES.es
  const fallback: Locale = LOCALES.es

  const keys = path.split('.')
  let current: unknown = locale
  for (const key of keys) {
    current = (current as Record<string, unknown>)?.[key]
    if (current === undefined) break
  }

  // Fallback to Spanish if key not found in target locale
  if (typeof current !== 'string') {
    current = keys.reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], fallback)
  }

  const str = typeof current === 'string' ? current : path
  return applyVars(str, vars)
}

// ── HOOK FOR CLIENT COMPONENTS ────────────────────────────
// Usage: const { t, isEN } = useT(lang)
//        <p>{t('pages.battles.title')}</p>
export function useT(lang: SupportedLang) {
  return {
    t: (path: string, vars?: Record<string, string | number>) => t(lang, path, vars),
    lang,
    isEN: lang === 'en',
    isES: lang === 'es',
  }
}

// ── DATA TRANSLATION HELPERS ──────────────────────────────
// Re-exported from data-translation files for one import
export { getBattleName }    from './data-translations/battles'
export { getCmdName }       from './data-translations/commanders'
export { getRoleName }      from './data-translations/roles'
export { getTagName }       from './data-translations/tags'
export { translateCombatants } from './data-translations/countries'
export { getCivName }       from './data-translations/civs'
export { getDocName }       from './data-translations/docs'
export { getEraName, getEraOverview } from './data-translations/eras'
export { autoTranslateDesc, translateDesc } from './data-translations/descriptions'

// translateYear stays here (pure function, no dictionary needed)
export function translateYear(lang: SupportedLang, year: string): string {
  if (lang !== 'en') return year
  return year
    .replace(/\bEne\b/g, 'Jan').replace(/\bFeb\b/g, 'Feb').replace(/\bMar\b/g, 'Mar')
    .replace(/\bAbr\b/g, 'Apr').replace(/\bMayo\b/gi, 'May').replace(/\bJun\b/g, 'Jun')
    .replace(/\bJul\b/g, 'Jul').replace(/\bAgo\b/g, 'Aug').replace(/\bSep\b/g, 'Sep')
    .replace(/\bOct\b/g, 'Oct').replace(/\bNov\b/g, 'Nov').replace(/\bDic\b/g, 'Dec')
    .replace(/\ba\.C\./g, 'BC').replace(/\bd\.C\./g, 'AD')
    .replace(/\bc\.\s*/g, 'c. ')
}
