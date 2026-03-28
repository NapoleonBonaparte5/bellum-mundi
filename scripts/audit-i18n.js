#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — i18n AUDIT SCRIPT (permanent)
//
// Usage:
//   node scripts/audit-i18n.js
//
// Checks:
//   1. All keys in es.ts are present in en.ts (and vice versa)
//   2. Every t(lang, 'some.path') call in the codebase resolves
//      to a real key in the Locale interface
//   3. Reports missing or stale keys
// ═══════════════════════════════════════════════════════════

const { readFileSync, readdirSync, statSync } = require('fs')
const { join, extname } = require('path')

// ── 1. Load locale objects ────────────────────────────────
// Parse the locale TS files by stripping type annotations and evaluating.
function loadLocale(filepath) {
  const src = readFileSync(filepath, 'utf8')
  // Strip TS import/type lines
  const stripped = src
    .replace(/^import\s+type\s+.*$/gm, '')
    .replace(/^import\s+.*$/gm, '')
    // Remove the TypeScript type annotation ": Locale"
    .replace(/:\s*Locale\s*=\s*/, ' = ')
    // Convert export const xx = { ... } to module.exports = { ... }
    .replace(/^export\s+const\s+\w+\s*=\s*/m, 'module.exports = ')

  try {
    const m = new module.constructor()
    m._compile(stripped, filepath)
    return m.exports
  } catch (e) {
    console.error('Failed to load locale:', filepath, e.message)
    return {}
  }
}

// ── 2. Flatten a nested object to dot paths ──────────────
function flatten(obj, prefix = '') {
  if (typeof obj !== 'object' || obj === null) return [prefix]
  return Object.entries(obj).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k)
  )
}

// ── 3. Scan source files for t() calls ───────────────────
function findFiles(dir, exts) {
  const results = []
  const SKIP = ['node_modules', '.next', '.git', 'scripts']
  for (const entry of readdirSync(dir)) {
    if (SKIP.includes(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) results.push(...findFiles(full, exts))
    else if (exts.includes(extname(entry))) results.push(full)
  }
  return results
}

const T_CALL = /\bt\(\s*\w+\s*,\s*['"`]([^'"`]+)['"`]/g

function extractTKeys(content) {
  const keys = []
  let m
  T_CALL.lastIndex = 0
  while ((m = T_CALL.exec(content)) !== null) {
    keys.push(m[1])
  }
  return keys
}

// ── MAIN ─────────────────────────────────────────────────
const root = join(__dirname, '..')

const esLocale = loadLocale(join(root, 'lib/i18n/locales/es.ts'))
const enLocale = loadLocale(join(root, 'lib/i18n/locales/en.ts'))

const esKeys = new Set(flatten(esLocale))
const enKeys = new Set(flatten(enLocale))

let issues = 0

// ── Check 1: Keys in ES missing from EN ──────────────────
const missingInEN = [...esKeys].filter(k => !enKeys.has(k))
if (missingInEN.length) {
  console.log(`\n❌ Keys in es.ts missing from en.ts (${missingInEN.length}):`)
  missingInEN.forEach(k => console.log(`   • ${k}`))
  issues += missingInEN.length
} else {
  console.log('\n✅ en.ts has all keys from es.ts')
}

// ── Check 2: Keys in EN missing from ES ──────────────────
const missingInES = [...enKeys].filter(k => !esKeys.has(k))
if (missingInES.length) {
  console.log(`\n❌ Keys in en.ts missing from es.ts (${missingInES.length}):`)
  missingInES.forEach(k => console.log(`   • ${k}`))
  issues += missingInES.length
} else {
  console.log('✅ es.ts has all keys from en.ts')
}

// ── Check 3: t() calls in code match locale keys ─────────
const sourceFiles = findFiles(root, ['.tsx', '.ts']).filter(f =>
  !f.includes('lib\\i18n\\') &&
  !f.includes('lib/i18n/') &&
  !f.includes('.next\\') &&
  !f.includes('.next/')
)

const unknownKeys = []
const usedKeys = new Set()

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8')
  const keys = extractTKeys(content)
  for (const key of keys) {
    usedKeys.add(key)
    if (!esKeys.has(key)) {
      unknownKeys.push({
        file: file.replace(root, '').replace(/\\/g, '/'),
        key
      })
    }
  }
}

if (unknownKeys.length) {
  console.log(`\n❌ t() calls with unknown keys (${unknownKeys.length}):`)
  unknownKeys.forEach(({ file, key }) => console.log(`   • ${key}  [${file}]`))
  issues += unknownKeys.length
} else {
  console.log('✅ All t() calls use valid locale keys')
}

// ── Check 4: Unused locale keys ──────────────────────────
const unusedKeys = [...esKeys].filter(k => !usedKeys.has(k))
if (unusedKeys.length) {
  console.log(`\nℹ️  Locale keys never used in code (${unusedKeys.length}):`)
  unusedKeys.forEach(k => console.log(`   • ${k}`))
}

// ── Summary ───────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
if (issues === 0) {
  console.log('✅ i18n audit PASSED — no issues found\n')
} else {
  console.log(`❌ i18n audit FAILED — ${issues} issue(s) found\n`)
  process.exit(1)
}
