// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — I18N TYPE SYSTEM
// To add a new language:
//   1. Add the code here (e.g. | 'de' | 'zh')
//   2. Create lib/i18n/locales/de.ts copying en.ts structure
//   3. Add to LOCALES map in lib/i18n/index.ts
//   4. Extend data-translations dictionaries with the new language
// That's it — no component changes needed.
// ═══════════════════════════════════════════════════════════

import type { Lang } from '../data/types'

// Canonical alias — matches Lang from data types
export type SupportedLang = Lang

// ─── LOCALE INTERFACE ────────────────────────────────────
// Every locale must satisfy this shape.
// Add new keys here when adding new UI strings.

export interface Locale {
  nav: {
    eras: string
    battles: string
    commanders: string
    worldmap: string
    chat: string
    educacion: string
    timeline: string
    weapons: string
    library: string
    civs: string
    premium: string
    newsletter: string
    langLabel: string
  }
  common: {
    announce: string
    back: string
    showMore: string
    queriesLabel: string
    freeText: string
    freeQueries: string
    freeQueriesSuffix: string
    freeCta: string
    searchEyebrow: string
    searchPlaceholder: string
    searchBtn: string
    militaryHistory: string
  }
  home: {
    hero: {
      ornament: string
      subtitle: string
      meta: string
      explore: string
      premium: string
      scroll: string
    }
    stats: {
      years: string
      battles: string
      civs: string
      commanders: string
      docs: string
    }
    timeline: {
      eyebrow: string
      title: string
      desc: string
      selectEra: string
      eraPlaceholder: string
    }
    eraStats: {
      battles: string
      years: string
      civs: string
      commanders: string
    }
    warQuote: {
      eyebrow: string
    }
    pricing: {
      eyebrow: string
      title: string
      desc: string
      billingMonthly: string
      billingAnnual: string
      saveBadge: string
      tierFree: string
      periodFree: string
      ctaFree: string
      tierPremium: string
      tierInst: string
      perMonth: string
      planFreeName: string
      planFreePrice: string
      planFreeDesc: string
      planPremiumName: string
      planPremiumBadge: string
      planAnnualBadge: string
      planAnnualLabel: string
      planEduName: string
      planEduDesc: string
      planEduBadge: string
    }
    newsletter: {
      eyebrow: string
      title: string
      desc: string
      badge: string
      nlTitle: string
      nlDesc: string
      nlProof: string
    }
  }
  pages: {
    battles: {
      eyebrow: string
      title: string
      subtitle: string
      searchPh: string
      found: string
      compareBtn: string
      compareSlot1: string
      compareSlot2: string
      compareGo: string
      advancedFilters: string
      sortChrono: string
      sortChronoDesc: string
      sortAlpha: string
      savedCollection: string
      removedCollection: string
    }
    commanders: {
      eyebrow: string
      title: string
      subtitle: string
      searchPh: string
      found: string
    }
    map: {
      eyebrow: string
      title: string
      allEras: string
      selectEra: string
      locations: string
      statBattles: string
      statEras: string
      statCountries: string
      statSpan: string
      statSpanVal: string
    }
    library: {
      eyebrow: string
      title: string
      subtitle: string
      filterAll: string
      filterTreaties: string
      filterClassics: string
      filterDocs: string
      filterLetters: string
      found: string
    }
    civs: {
      eyebrow: string
      title: string
      subtitle: string
      found: string
    }
  }
  tabs: {
    battles: string
    commanders: string
    weapons: string
    civs: string
    tactics: string
    docs: string
    searchBattlePh: string
    searchCmdPh: string
    showMore: string
  }
  detail: {
    sidebarBattles: string
    sidebarCommanders: string
    sidebarWeapons: string
    sidebarTactics: string
    sidebarLocation: string
    sidebarEraBattles: string
    sidebarContemporaries: string
    sidebarEraWeapons: string
    compareEyebrow: string
    loadingAi: string
    loadingCompare: string
    pickerTitle1: string
    pickerTitle2: string
    pickerSearch: string
    pickerEmpty: string
    pickerMore: string
    backBtn: string
    historyMilitary: string
    analysisTab: string
    simulatorTab: string
    view3dTab: string
    comingSoon: string
    viz3dTitle: string
    viz3dDesc: string
    viz3dBadge: string
  }
  search: {
    battles: string
    commanders: string
    civs: string
    docs: string
    weapons: string
    empty: string
  }
  auth: {
    loginBtn: string
    registerTitle: string
    loginTitle: string
    namePh: string
    emailPh: string
    passwordPh: string
    passPh: string
    login: string
    register: string
  }
  ai: {
    lang: string
    loading: string
    loadingCompare: string
    explainBattle: string
    explainCommander: string
    explainCiv: string
    explainDoc: string
    explainWeapon: string
    explainTactic: string
  }
  footer: {
    desc: string
    exploreTitle: string
    productTitle: string
    legalTitle: string
    privacyLink: string
    termsLink: string
    cookiesLink: string
    contactLink: string
    pricesLink: string
    registerLink: string
    privacyPolicy: string
    termsOfUse: string
    affiliates: string
    copy: string
  }
}
