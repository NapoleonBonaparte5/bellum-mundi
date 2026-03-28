// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — ERA DATA (expanded v2)
// 10 eras · 2000+ battles · 300+ commanders
// ═══════════════════════════════════════════════════════════

import type { Era } from './types'

import { PREHISTORIC_ERA } from './eras/prehistoric'
import { ANCIENT_ERA } from './eras/ancient'
import { CLASSICAL_ERA } from './eras/classical'
import { MEDIEVAL_ERA } from './eras/medieval'
import { EARLY_MODERN_ERA } from './eras/early_modern'
import { NAPOLEON_ERA } from './eras/napoleon'
import { WW1_ERA } from './eras/ww1'
import { WW2_ERA } from './eras/ww2'
import { COLD_WAR_ERA } from './eras/cold_war'
import { CONTEMPORARY_ERA } from './eras/contemporary'

export const ERAS: Era[] = [
  PREHISTORIC_ERA,
  ANCIENT_ERA,
  CLASSICAL_ERA,
  MEDIEVAL_ERA,
  EARLY_MODERN_ERA,
  NAPOLEON_ERA,
  WW1_ERA,
  WW2_ERA,
  COLD_WAR_ERA,
  CONTEMPORARY_ERA,
]
