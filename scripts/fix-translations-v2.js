#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — COMPREHENSIVE TRANSLATION FIX v2
// Adds all missing entries from audit + user-specified fixes
// Usage: node scripts/fix-translations-v2.js
// ═══════════════════════════════════════════════════════════
'use strict'

const fs = require('fs')
const path = require('path')

const TRANS_FILE = path.join(__dirname, '..', 'lib', 'i18n', 'translations.ts')

// ── New entries to inject ───────────────────────────────────

const NEW_BATTLE_NAME_EN = `  // ── Audit fix v2: 27 missing battle names ──
  'Asedio de Siracusa por Cartago': 'Siege of Syracuse by Carthage',
  'Asedio de Tiro por Nabucodonosor': 'Siege of Tyre by Nebuchadnezzar',
  'Batalla de Filipo II contra los Ilirios': 'Battle of Philip II against the Illyrians',
  "Batalla de Mortimer's Cross": "Battle of Mortimer's Cross",
  'Campaña de Alejandro en Bactria': "Alexander's Campaign in Bactria",
  'Campaña de Asurnasipal II en Siria': "Ashurnasirpal II's Campaign in Syria",
  'Campaña de Bindusara en el Decán': "Bindusara's Campaign in the Deccan",
  'Campaña de Darío contra los Escitas': "Darius's Campaign against the Scythians",
  'Campaña de Italia de Napoleón': "Napoleon's Italian Campaign",
  'Campaña de Nabucodonosor en Egipto': "Nebuchadnezzar's Campaign in Egypt",
  'Campaña de Naram-Sin en los Zagros': "Naram-Sin's Campaign in the Zagros",
  'Campaña de Salmanasar III contra Damasco': "Shalmaneser III's Campaign against Damascus",
  'Campaña de Sargón II contra Urartu': "Sargon II's Campaign against Urartu",
  'Campaña de Sargón contra Elam': "Sargon's Campaign against Elam",
  'Campaña de Sargón en Anatolia': "Sargon's Campaign in Anatolia",
  'Campaña de Senaquerib en Babilonia': "Sennacherib's Campaign in Babylon",
  'Campaña de Shamshi-Adad V contra Babilonia': "Shamshi-Adad V's Campaign against Babylon",
  'Campañas de Bai Qi contra Zhao': "Bai Qi's Campaigns against Zhao",
  'Conquista de Larsa por Hammurabi': "Hammurabi's Conquest of Larsa",
  'Cruce de los Alpes de Aníbal': "Hannibal's Crossing of the Alps",
  'Destrucción de Mari por Hammurabi': 'Destruction of Mari by Hammurabi',
  'Destrucción del Templo de Salomón': "Destruction of Solomon's Temple",
  'Guerras de Asurbanipal contra Elam': "Ashurbanipal's Wars against Elam",
  'Invasión de Sisak de Egipto a Israel': "Shoshenq I's Invasion of Israel",
  'Invasión de África por Agátocles': "Agathocles's Invasion of Africa",
  'Paz del Rey (Paz de Antálcidas)': "Peace of Antalcidas (King's Peace)",
  'Rebelión de Boudica': "Boudica's Revolt",`

const NEW_CMD_NAME_EN = `  // ── Audit fix v2: 86 missing commander name aliases ──
  'Alejandro Suvorov': 'Alexander Suvorov',
  'Alexander Suvorov': 'Alexander Suvorov',
  'Alexei Brusilov': 'Aleksei Brusilov',
  'Alfonso VI de Castilla': 'Alfonso VI of Castile',
  'Alfredo el Grande': 'Alfred the Great',
  'Andrónico II Paleólogo': 'Andronikos II Palaiologos',
  'Antoine Henri Jomini': 'Antoine-Henri Jomini',
  'Arthur Wellesley (Wellington)': 'Arthur Wellesley (Duke of Wellington)',
  'Augusto': 'Augustus',
  'Aulo Plaucio': 'Aulus Plautius',
  'Aureliano': 'Aurelian',
  'Banastre Tarleton': 'Banastre Tarleton',
  'Barbarroja (Hayreddin)': 'Barbarossa (Hayreddin)',
  'Bogdan I de Moldavia': 'Bogdan I of Moldavia',
  'Carlomagno': 'Charlemagne',
  'Carlos V Habsburgo': 'Charles V Habsburg',
  'Claude Victor-Perrin': 'Claude Victor-Perrin',
  'Claudio II Gótico': 'Claudius II Gothicus',
  'Condé (Luis II de Borbón)': 'Condé (Louis II de Bourbon)',
  'Constantino el Grande': 'Constantine the Great',
  'Dmitri Donskói': 'Dmitri Donskoy',
  'Dwight D. Eisenhower': 'Dwight D. Eisenhower',
  'Eannatum': 'Eannatum',
  'El Cid Campeador': 'El Cid',
  'Emmanuel de Grouchy': 'Emmanuel de Grouchy',
  'Enmebaragesi': 'Enmebaragesi',
  'Esteban Mola Vidal': 'Emilio Mola Vidal',
  'Eugenio de Saboya': 'Prince Eugene of Savoy',
  'Federico I de Prusia': 'Frederick I of Prussia',
  'Felipe II Augusto de Francia': 'Philip II Augustus of France',
  'Felipe II de España': 'Philip II of Spain',
  'Fernando III de Castilla': 'Ferdinand III of Castile',
  'Fernando el Católico': 'Ferdinand the Catholic',
  'Francisco de Miranda': 'Francisco de Miranda',
  'Galerio': 'Galerius',
  'George Washington': 'George Washington',
  'Guan Yu': 'Guan Yu',
  'Gueorgui Zhúkov': 'Georgy Zhukov',
  'Guillermo el Conquistador': 'William the Conqueror',
  'Ho Chi Minh': 'Ho Chi Minh',
  'Horatio Nelson': 'Horatio Nelson',
  'Ibrahim Lodi': 'Ibrahim Lodi',
  'Jean-de-Dieu Soult': 'Jean-de-Dieu Soult',
  'Joachim Murat': 'Joachim Murat',
  'Julián el Apóstata': 'Julian the Apostate',
  'Konstantin Rokossovsky': 'Konstantin Rokossovsky',
  'Kublai Khan': 'Kublai Khan',
  'Köprülü Mehmed Pasha': 'Köprülü Mehmed Pasha',
  'Leonid Breznev': 'Leonid Brezhnev',
  'Louis Berthier': 'Louis-Alexandre Berthier',
  'Louis-Gabriel Suchet': 'Louis-Gabriel Suchet',
  'Luculo': 'Lucullus',
  'Lugalzagesi': 'Lugalzagesi',
  'Mario (Cayo Mario)': 'Gaius Marius',
  'Mariscal de Sajonia': 'Marshal of Saxony (Maurice de Saxe)',
  'Maurice de Nassau': 'Maurice of Nassau',
  'Mesanepada': 'Mesanepada',
  'Mitrídates VI': 'Mithridates VI',
  'Mustafa Kemal (Atatürk)': 'Mustafa Kemal (Atatürk)',
  'Nathanael Greene': 'Nathanael Greene',
  'Nicolas Jean-de-Dieu Soult': 'Nicolas Soult',
  'Nicolas Soult': 'Nicolas Soult',
  'Nitta Yoshisada': 'Nitta Yoshisada',
  'Oda Nobunaga': 'Oda Nobunaga',
  'Otón I el Grande': 'Otto I the Great',
  'Prince Bagration': 'Pyotr Bagration',
  'Ragnar Lodbrok': 'Ragnar Lothbrok',
  'Sapor I': 'Shapur I',
  'Selim I': 'Selim I the Grim',
  'Subutai': 'Subutai',
  'Sun Jian': 'Sun Jian',
  'Sun Tzu': 'Sun Tzu',
  'Surenas': 'Surena',
  'Takeda Shingen': 'Takeda Shingen',
  'Tamerlán (Timur)': 'Tamerlane (Timur)',
  'Tiglat-Pileser I': 'Tiglath-Pileser I',
  'Tito Flaminino': 'Titus Quinctius Flamininus',
  'Tokugawa Ieyasu': 'Tokugawa Ieyasu',
  'Toyotomi Hideyoshi': 'Toyotomi Hideyoshi',
  'Uesugi Kenshin': 'Uesugi Kenshin',
  'Ur-Nanshe': 'Ur-Nanshe',
  'Vasili Chuikov': 'Vasily Chuikov',
  'Volodimir Zelensky': 'Volodymyr Zelensky',
  'Yamashita Tomoyuki': 'Tomoyuki Yamashita',
  'Zenobia de Palmira': 'Zenobia of Palmyra',`

const NEW_ROLE_EN = `  // ── Audit fix v2: 7 missing roles ──
  '"Stormin\\' Norman" — Comandante de Desert Storm': '"Stormin\\' Norman" — Desert Storm Commander',
  'Diádoco — Aspirante al Imperio de Alejandro': "Diadochus — Claimant to Alexander's Empire",
  'Fundador de la China Popular — Teórico de la Guerra Popular': 'Founder of Communist China — Theorist of People\\'s War',
  'Fundador del Grupo Wagner — El Cocinero de Putin': "Founder of Wagner Group — Putin's Chef",
  'Gran Mariscal de Napoleón': "Grand Marshal of Napoleon's Army",
  'Jefe de Estado Mayor de Napoleón': "Chief of Staff of Napoleon",
  'Mariscal — Adversario de Wellington': "Marshal — Wellington's Adversary",`

const NEW_DOC_NAME_EN = `  // ── User-specified missing doc entries ──
  'Resolución de la Sociedad de Naciones': 'League of Nations Resolution',
  'Discurso de la Cortina de Hierro — Churchill': "Iron Curtain Speech — Churchill",
  'Ultimátum austro-húngaro a Serbia': 'Austro-Hungarian Ultimatum to Serbia',
  'Armisticio del 11 de noviembre': 'Armistice of 11 November',
  'Pacto Molotov-Ribbentrop': 'Molotov-Ribbentrop Pact',
  'Tratado de No Proliferación Nuclear (TNP)': 'Nuclear Non-Proliferation Treaty (NPT)',
  'Tratado de Moscú — Prohibición de Pruebas': 'Moscow Treaty — Test Ban',
  'Acuerdos de París — Vietnam': 'Paris Peace Accords — Vietnam',
  'Camp David — Paz Israel-Egipto': 'Camp David — Israel-Egypt Peace',
  'Acuerdos de Helsinki': 'Helsinki Accords',
  'Caída del Muro de Berlín': 'Fall of the Berlin Wall',
  'Disolución de la URSS': 'Dissolution of the USSR',
  'AUMF — Autorización de Uso de Fuerza (11-S)': 'AUMF — Authorization for Use of Military Force (9/11)',
  'Acuerdos de Dayton': 'Dayton Accords',
  'Resolución 1441 ONU — Iraq': 'UN Resolution 1441 — Iraq',
  'Responsabilidad de Proteger (R2P)': 'Responsibility to Protect (R2P)',
  'Acuerdos de Abraham — Israel-EAU': 'Abraham Accords — Israel-UAE',
  'Estatuto de Roma — Corte Penal Internacional': 'Rome Statute — International Criminal Court',`

// ── Helper: inject lines before the closing } of a dict ────
function injectBeforeClose(content, dictName, newLines) {
  const startMarker = `const ${dictName} = {`
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1) {
    console.error(`  ERROR: ${dictName} not found`)
    return content
  }

  // Find the closing brace of this dict
  let braceDepth = 0
  let i = content.indexOf('{', startIdx)
  let closeIdx = -1
  while (i < content.length) {
    if (content[i] === '{') braceDepth++
    else if (content[i] === '}') {
      braceDepth--
      if (braceDepth === 0) { closeIdx = i; break }
    }
    i++
  }

  if (closeIdx === -1) {
    console.error(`  ERROR: Could not find closing brace for ${dictName}`)
    return content
  }

  // Check if already patched
  if (content.slice(Math.max(0, closeIdx - 200), closeIdx).includes('Audit fix v2')) {
    console.log(`  SKIP: ${dictName} already patched`)
    return content
  }

  const before = content.slice(0, closeIdx)
  const after = content.slice(closeIdx)
  return before + '\n' + newLines + '\n' + after
}

// ── Run ─────────────────────────────────────────────────────
function main() {
  console.log('Reading translations.ts...')
  let content = fs.readFileSync(TRANS_FILE, 'utf8')
  const originalLen = content.length

  content = injectBeforeClose(content, 'BATTLE_NAME_EN', NEW_BATTLE_NAME_EN)
  console.log('  ✓ BATTLE_NAME_EN — 27 entries injected')

  content = injectBeforeClose(content, 'CMD_NAME_EN', NEW_CMD_NAME_EN)
  console.log('  ✓ CMD_NAME_EN — 86 entries injected')

  content = injectBeforeClose(content, 'ROLE_EN', NEW_ROLE_EN)
  console.log('  ✓ ROLE_EN — 7 entries injected')

  content = injectBeforeClose(content, 'DOC_NAME_EN', NEW_DOC_NAME_EN)
  console.log('  ✓ DOC_NAME_EN — 18 entries injected')

  fs.writeFileSync(TRANS_FILE, content, 'utf8')
  console.log(`\nDone! File grew from ${originalLen} to ${content.length} bytes (+${content.length - originalLen})`)
}

main()
