#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — TRANSLATION AUDIT SCRIPT
// Reads all era files, compares against translation dictionaries
// Usage: node scripts/audit-translations.js
// ═══════════════════════════════════════════════════════════
'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const ERAS_DIR = path.join(ROOT, 'lib', 'data', 'eras')
const TRANS_FILE = path.join(ROOT, 'lib', 'i18n', 'translations.ts')

// ── Extract field value from a line ────────────────────────
function extractField(line, field) {
  // Handle both single and double quotes
  const sq = new RegExp(`${field}:'([^']*)'`)
  const dq = new RegExp(`${field}:"([^"]*)"`)
  const m = line.match(sq) || line.match(dq)
  return m ? m[1] : null
}

// ── Parse all era files ─────────────────────────────────────
function parseEraFiles() {
  const files = fs.readdirSync(ERAS_DIR).filter(f => f.endsWith('.ts'))
  const data = {
    battleNames: new Set(),
    commanderNames: new Set(),
    commanderRoles: new Set(),
    docNames: new Set(),
    tags: new Set(),
  }

  for (const file of files) {
    const content = fs.readFileSync(path.join(ERAS_DIR, file), 'utf8')
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//')) continue

      // Battle: has 'combatants:' field
      if (trimmed.includes('combatants:')) {
        const name = extractField(trimmed, 'name')
        const tag = extractField(trimmed, 'tag')
        if (name) data.battleNames.add(name)
        if (tag) data.tags.add(tag)
        continue
      }

      // Commander: has 'emoji:' field
      if (trimmed.includes('emoji:')) {
        const name = extractField(trimmed, 'name')
        const role = extractField(trimmed, 'role')
        if (name) data.commanderNames.add(name)
        if (role) data.commanderRoles.add(role)
        continue
      }

      // Doc: has 'category:' field
      if (trimmed.includes('category:')) {
        const name = extractField(trimmed, 'name')
        if (name) data.docNames.add(name)
        continue
      }
    }
  }

  return data
}

// ── Extract dictionary keys from translations.ts ────────────
function extractDictKeys(content, dictName) {
  const start = content.indexOf(`const ${dictName} = {`)
  if (start === -1) {
    console.warn(`  WARNING: Dictionary ${dictName} not found`)
    return new Set()
  }

  let i = content.indexOf('{', start) + 1
  let depth = 1
  let end = i
  while (end < content.length && depth > 0) {
    if (content[end] === '{') depth++
    else if (content[end] === '}') depth--
    end++
  }

  const section = content.slice(i, end - 1)
  const keys = new Set()

  // Match 'key': 'value' patterns
  const regex = /'([^']+)':\s*'[^']*'/g
  let m
  while ((m = regex.exec(section)) !== null) {
    keys.add(m[1])
  }
  // Match "key": 'value' with double-quoted keys
  const regex2 = /"([^"]+)":\s*'[^']*'/g
  while ((m = regex2.exec(section)) !== null) {
    keys.add(m[1])
  }

  return keys
}

// ── Main ────────────────────────────────────────────────────
function main() {
  console.log('═'.repeat(60))
  console.log('BELLUM MUNDI — TRANSLATION AUDIT')
  console.log('═'.repeat(60))
  console.log()

  // 1. Parse era files
  console.log('Reading era files...')
  const eraData = parseEraFiles()
  console.log(`  Battle names:     ${eraData.battleNames.size}`)
  console.log(`  Commander names:  ${eraData.commanderNames.size}`)
  console.log(`  Commander roles:  ${eraData.commanderRoles.size}`)
  console.log(`  Document names:   ${eraData.docNames.size}`)
  console.log(`  Battle tags:      ${eraData.tags.size}`)
  console.log()

  // 2. Parse translation dictionaries
  console.log('Reading translations.ts...')
  const transContent = fs.readFileSync(TRANS_FILE, 'utf8')
  const dicts = {
    BATTLE_NAME_EN: extractDictKeys(transContent, 'BATTLE_NAME_EN'),
    CMD_NAME_EN: extractDictKeys(transContent, 'CMD_NAME_EN'),
    ROLE_EN: extractDictKeys(transContent, 'ROLE_EN'),
    DOC_NAME_EN: extractDictKeys(transContent, 'DOC_NAME_EN'),
    TAG_EN: extractDictKeys(transContent, 'TAG_EN'),
  }
  for (const [name, dict] of Object.entries(dicts)) {
    console.log(`  ${name}: ${dict.size} entries`)
  }
  console.log()

  // 3. Compute missing entries
  const missing = {
    BATTLE_NAME_EN: [...eraData.battleNames].filter(n => !dicts.BATTLE_NAME_EN.has(n)).sort(),
    CMD_NAME_EN: [...eraData.commanderNames].filter(n => !dicts.CMD_NAME_EN.has(n)).sort(),
    ROLE_EN: [...eraData.commanderRoles].filter(r => !dicts.ROLE_EN.has(r)).sort(),
    DOC_NAME_EN: [...eraData.docNames].filter(n => !dicts.DOC_NAME_EN.has(n)).sort(),
    TAG_EN: [...eraData.tags].filter(t => !dicts.TAG_EN.has(t)).sort(),
  }

  // 4. Print report
  for (const [dictName, entries] of Object.entries(missing)) {
    if (entries.length === 0) {
      console.log(`✓ ${dictName}: all entries covered`)
      continue
    }
    console.log(`✗ ${dictName}: ${entries.length} MISSING entries`)
    for (const entry of entries) {
      console.log(`    '${entry}'`)
    }
    console.log()
  }

  // 5. Save JSON report
  const reportPath = path.join(__dirname, 'audit-report.json')
  const report = {
    timestamp: new Date().toISOString(),
    totals: {
      battleNames: eraData.battleNames.size,
      commanderNames: eraData.commanderNames.size,
      commanderRoles: eraData.commanderRoles.size,
      docNames: eraData.docNames.size,
      tags: eraData.tags.size,
    },
    missing,
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\nReport saved to: ${reportPath}`)
}

main()
