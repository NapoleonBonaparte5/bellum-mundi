// Auto-translate missing descs and tags, append to translation files
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const eraDir = path.join(ROOT, 'lib/data/eras');
const descFile = path.join(ROOT, 'lib/i18n/descTranslations.ts');
const transFile = path.join(ROOT, 'lib/i18n/translations.ts');

// ── Translation helpers ─────────────────────────────────────

const WORD_MAP = {
  // Verbs
  'vence': 'defeats', 'vencen': 'defeat', 'derrota': 'defeats', 'derrotan': 'defeat',
  'conquista': 'conquers', 'conquistan': 'conquer', 'conquistan': 'conquer',
  'destruye': 'destroys', 'destruyen': 'destroy', 'destruida': 'destroyed',
  'captura': 'captures', 'capturan': 'capture', 'capturado': 'captured',
  'sitiada': 'besieged', 'sitiado': 'besieged', 'sitia': 'besieges',
  'invade': 'invades', 'invaden': 'invade', 'invadida': 'invaded',
  'rinde': 'surrenders', 'se rinde': 'surrenders', 'rendición': 'surrender',
  'muere': 'dies', 'murió': 'died', 'muertos': 'killed', 'muerto': 'dead',
  'masacrados': 'massacred', 'masacre': 'massacre', 'masacrado': 'massacred',
  'aniquilados': 'annihilated', 'aniquilado': 'annihilated',
  'expulsa': 'expels', 'expulsan': 'expel', 'expulsión': 'expulsion',
  'huye': 'flees', 'huyen': 'flee', 'huyó': 'fled',
  'resiste': 'resists', 'resistencia': 'resistance',
  'une': 'unifies', 'unifica': 'unifies', 'unificación': 'unification',
  'funda': 'founds', 'fundación': 'foundation',
  'nace': 'is born', 'nacimiento': 'birth',
  'emerge': 'emerges', 'colapsa': 'collapses', 'colapso': 'collapse',
  'termina': 'ends', 'fin de': 'end of', 'inicio de': 'beginning of',
  'lidera': 'leads', 'manda': 'commands', 'dirige': 'commands',
  'interviene': 'intervenes', 'intervención': 'intervention',
  'gana': 'wins', 'pierde': 'loses', 'empate': 'draw',
  'libera': 'liberates', 'liberación': 'liberation',
  'avanza': 'advances', 'retrocede': 'retreats', 'retirada': 'retreat',
  'cruza': 'crosses', 'cruce': 'crossing',
  'bloquea': 'blockades', 'bloqueo': 'blockade',
  'bombardea': 'bombs', 'bombardeo': 'bombing',
  'ataca': 'attacks', 'ataque': 'attack', 'asalta': 'assaults', 'asalto': 'assault',
  'defiende': 'defends', 'defensa': 'defense',
  'introduce': 'introduces', 'inventa': 'invents',
  'reforma': 'reforms', 'reformas': 'reforms',
  'innova': 'innovates', 'innovación': 'innovation',
  // Military terms
  'batalla': 'battle', 'guerra': 'war', 'campaña': 'campaign',
  'ejército': 'army', 'flota': 'fleet', 'soldados': 'soldiers',
  'tropas': 'troops', 'caballería': 'cavalry', 'infantería': 'infantry',
  'legión': 'legion', 'legiones': 'legions', 'legionarios': 'legionaries',
  'mercenarios': 'mercenaries', 'arqueros': 'archers',
  'carros': 'chariots', 'carro': 'chariot', 'elefantes': 'elephants',
  'tanques': 'tanks', 'aviones': 'aircraft', 'bombarderos': 'bombers',
  'submarinos': 'submarines', 'barcos': 'ships', 'navíos': 'warships',
  'fortaleza': 'fortress', 'muralla': 'wall', 'murallas': 'walls',
  'asedio': 'siege', 'emboscada': 'ambush', 'envolvimiento': 'encirclement',
  'táctica': 'tactic', 'tácticas': 'tactics', 'estrategia': 'strategy',
  'victoria': 'victory', 'derrota': 'defeat', 'rendición': 'surrender',
  'armisticio': 'armistice', 'tratado': 'treaty', 'paz': 'peace',
  // People/entities
  'romanos': 'Romans', 'cartagineses': 'Carthaginians', 'griegos': 'Greeks',
  'persas': 'Persians', 'macedonios': 'Macedonians', 'mongoles': 'Mongols',
  'vikingos': 'Vikings', 'normandos': 'Normans', 'sajones': 'Saxons',
  'francos': 'Franks', 'hunos': 'Huns', 'turcos': 'Turks', 'árabes': 'Arabs',
  'cruzados': 'Crusaders', 'otomanos': 'Ottomans', 'hititas': 'Hittites',
  'egipcios': 'Egyptians', 'asirios': 'Assyrians', 'sumerios': 'Sumerians',
  'babilonios': 'Babylonians', 'judíos': 'Jews', 'israelitas': 'Israelites',
  'filisteos': 'Philistines', 'espartanos': 'Spartans', 'atenienses': 'Athenians',
  'tebanos': 'Thebans', 'escitas': 'Scythians', 'partos': 'Parthians',
  'alemanes': 'Germans', 'franceses': 'French', 'ingleses': 'English',
  'polacos': 'Poles', 'rusos': 'Russians', 'japoneses': 'Japanese',
  'chinos': 'Chinese', 'americanos': 'Americans', 'soviéticos': 'Soviets',
  'nazis': 'Nazis', 'aliados': 'Allies',
  // Places
  'Roma': 'Rome', 'Cartago': 'Carthage', 'Grecia': 'Greece', 'Atenas': 'Athens',
  'Esparta': 'Sparta', 'Persia': 'Persia', 'Egipto': 'Egypt', 'Siria': 'Syria',
  'Mesopotamia': 'Mesopotamia', 'Babilonia': 'Babylon', 'Nínive': 'Nineveh',
  'Asiria': 'Assyria', 'Constantinopla': 'Constantinople', 'Jerusalén': 'Jerusalem',
  'España': 'Spain', 'Francia': 'France', 'Alemania': 'Germany',
  'Italia': 'Italy', 'Rusia': 'Russia', 'China': 'China', 'Japón': 'Japan',
  'India': 'India', 'Britania': 'Britain', 'Britaña': 'Britain',
  'Normandía': 'Normandy', 'Berlín': 'Berlin', 'Moscú': 'Moscow',
  'Stalingrado': 'Stalingrad', 'Leningrado': 'Leningrad',
  // Time/numbers
  'primera': 'first', 'primera': 'first', 'segundo': 'second', 'tercera': 'third',
  'mayor': 'greatest', 'mayor': 'greatest', 'más grande': 'largest',
  'definitiva': 'decisive', 'definitivo': 'decisive',
  'masiva': 'massive', 'masivo': 'massive', 'total': 'total',
  'completa': 'complete', 'completo': 'complete',
  'histórica': 'historic', 'histórico': 'historic',
  // Common phrases
  'por primera vez': 'for the first time',
  'hasta ese momento': 'up to that point',
  'en la historia': 'in history',
  'de la historia': 'in history',
  'nunca antes': 'never before',
  'el mayor': 'the greatest',
  'la mayor': 'the greatest',
  'nace el concepto': 'the concept is born',
  'la caballería': 'the cavalry',
  'el ejército': 'the army',
  'la flota': 'the fleet',
  'fin de': 'end of',
  'caída de': 'fall of',
  'inicio de': 'beginning of',
};

// Tag translations
const TAG_TRANSLATIONS = {
  // Prehistoric
  'Epipaleolítico': 'Epipalaeolithic',
  'EPIPALEOLÍTICO': 'Epipalaeolithic',
  'Mesolítico': 'Mesolithic',
  'MESOLÍTICO': 'Mesolithic',
  'Neolítico Temprano': 'Early Neolithic',
  'Neolítico Medio': 'Middle Neolithic',
  'Neolítico Tardío': 'Late Neolithic',
  'Neolítico Final': 'Final Neolithic',
  'NEOLÍTICO FINAL': 'Final Neolithic',
  'Calcolítico Temprano': 'Early Chalcolithic',
  'Calcolítico Tardío': 'Late Chalcolithic',
  'Calcolítico Final': 'Final Chalcolithic',
  'CALCOLÍTICO FINAL': 'Final Chalcolithic',
  'Bronce Temprano': 'Early Bronze Age',
  'BRONCE TEMPRANO': 'Early Bronze Age',
  'Bronce Medio': 'Middle Bronze Age',
  'Bronce Final': 'Late Bronze Age',
  'Hierro Temprano': 'Early Iron Age',
  'Pre-Dinástico': 'Pre-Dynastic',
  'Pre-dinástico': 'Pre-Dynastic',
  // Ancient
  'Imperio Acadio': 'Akkadian Empire',
  'Sumer Arcaico': 'Archaic Sumer',
  'Período Dinástico': 'Dynastic Period',
  'Antiguo Reino': 'Old Kingdom',
  'Primer Período Intermedio': 'First Intermediate Period',
  'Reino Medio': 'Middle Kingdom',
  'Segundo Período Intermedio': 'Second Intermediate Period',
  'Nuevo Imperio Egipcio': 'New Egyptian Empire',
  'Tercer Período Intermedio': 'Third Intermediate Period',
  'Período Tardío': 'Late Period',
  'Edad del Hierro': 'Iron Age',
  'Colapso del Bronce': 'Bronze Age Collapse',
  'Guerras Mesopotámicas': 'Mesopotamian Wars',
  'Guerras Asirias': 'Assyrian Wars',
  'Guerras Babilónicas': 'Babylonian Wars',
  'Imperio Neo-Babilónico': 'Neo-Babylonian Empire',
  'Imperio Persa': 'Persian Empire',
  'Guerras Greco-Persas': 'Greco-Persian Wars',
  'Guerras del Peloponeso': 'Peloponnesian Wars',
  'Conquistas de Alejandro': 'Conquests of Alexander',
  'Guerras Diádocos': 'Diadochi Wars',
  'Guerras Helenísticas': 'Hellenistic Wars',
  'Guerras de los Seléucidas': 'Seleucid Wars',
  'Guerras de los Lágidas': 'Ptolemaic Wars',
  // Classical/Roman
  'Guerras Samnitas': 'Samnite Wars',
  'Guerras Latinas': 'Latin Wars',
  'Guerras Pirras': 'Pyrrhic Wars',
  'Guerras Romanas': 'Roman Wars',
  'República Romana': 'Roman Republic',
  'Imperio Romano': 'Roman Empire',
  'Guerras Civiles Romanas': 'Roman Civil Wars',
  'Conquistas Romanas': 'Roman Conquests',
  'Fin del Imperio': 'Fall of the Empire',
  'Invasiones Bárbaras': 'Barbarian Invasions',
  // Medieval
  'Guerras Islámicas': 'Islamic Wars',
  'Conquista Islámica': 'Islamic Conquest',
  'Califato Omeya': 'Umayyad Caliphate',
  'Califato Abásida': 'Abbasid Caliphate',
  'Guerras Carolingias': 'Carolingian Wars',
  'Guerras Vikingas': 'Viking Wars',
  'Conquista Normanda': 'Norman Conquest',
  'Guerra de los Cien Años': 'Hundred Years War',
  'Guerra de las Rosas': 'War of the Roses',
  'Guerras Husitas': 'Hussite Wars',
  'Reconquista Española': 'Spanish Reconquista',
  'Cruzada Albigense': 'Albigensian Crusade',
  'Segunda Cruzada': 'Second Crusade',
  'Cuarta Cruzada': 'Fourth Crusade',
  'Quinta Cruzada': 'Fifth Crusade',
  'Sexta Cruzada': 'Sixth Crusade',
  'Séptima Cruzada': 'Seventh Crusade',
  'Invasión Mongola': 'Mongol Invasion',
  'Conquistas Mongolas': 'Mongol Conquests',
  'Guerras Otomanas': 'Ottoman Wars',
  'Caída de Constantinopla': 'Fall of Constantinople',
  'Bizancio': 'Byzantium',
  'Guerras Bizantinas': 'Byzantine Wars',
  'Guerras de Sucesión': 'Wars of Succession',
  // Early Modern
  'Guerras de Religión': 'Wars of Religion',
  'Reforma Protestante': 'Protestant Reformation',
  'Guerra de los Treinta Años': 'Thirty Years War',
  'Guerra de los Ochenta Años': 'Eighty Years War',
  'Conquistas Coloniales': 'Colonial Conquests',
  'Conquista de América': 'Conquest of America',
  'Imperio Otomano': 'Ottoman Empire',
  'Guerras Polaco-Suecas': 'Polish-Swedish Wars',
  'Gran Guerra del Norte': 'Great Northern War',
  'Guerras de Luis XIV': 'Wars of Louis XIV',
  'Guerra de Sucesión Española': 'War of Spanish Succession',
  'Guerra de Sucesión Austriaca': 'War of Austrian Succession',
  'Guerras Sengoku': 'Sengoku Wars',
  'Unificación de Japón': 'Unification of Japan',
  'Guerras Moghol': 'Mughal Wars',
  // Napoleon era
  'Guerras Revolucionarias': 'Revolutionary Wars',
  'Primera Coalición': 'First Coalition',
  'Segunda Coalición': 'Second Coalition',
  'Tercera Coalición': 'Third Coalition',
  'Cuarta Coalición': 'Fourth Coalition',
  'Quinta Coalición': 'Fifth Coalition',
  'Sexta Coalición': 'Sixth Coalition',
  'Séptima Coalición': 'Seventh Coalition',
  'Campaña de Egipto': 'Egyptian Campaign',
  'Campaña de Italia': 'Italian Campaign',
  'Campaña de Rusia': 'Russian Campaign',
  'Campaña de Alemania': 'German Campaign',
  'Campaña de España': 'Spanish Campaign',
  'Campaña de los Cien Días': 'Hundred Days Campaign',
  'Guerras de Independencia': 'Wars of Independence',
  // WWI
  'Frente del Somme': 'Battle of the Somme',
  'Frente de Verdún': 'Battle of Verdun',
  'Campaña de Mesopotamia': 'Mesopotamia Campaign',
  'Campaña de Palestina': 'Palestine Campaign',
  'Frente Macedónico': 'Macedonian Front',
  'Frente Caucásico': 'Caucasian Front',
  'Guerra de Movimiento': 'War of Movement',
  'Guerra de Trincheras': 'Trench Warfare',
  'Ofensiva de Primavera': 'Spring Offensive',
  'Ofensiva de los Cien Días': 'Hundred Days Offensive',
  // WWII
  'Operación Barbarroja': 'Operation Barbarossa',
  'Operación Overlord': 'Operation Overlord',
  'Operación Market Garden': 'Operation Market Garden',
  'Campaña del Pacífico': 'Pacific Campaign',
  'Campaña del Norte de África': 'North Africa Campaign',
  'Campaña de Italia': 'Italian Campaign',
  'Frente del Este': 'Eastern Front',
  'Frente del Oeste': 'Western Front',
  'Desembarco de Normandía': 'D-Day Normandy',
  'Batalla de Inglaterra': 'Battle of Britain',
  'Guerra Submarina': 'Submarine War',
  'Bomba Atómica': 'Atomic Bomb',
  'Holocausto': 'Holocaust',
  // Cold War / Contemporary
  'Guerra Fría': 'Cold War',
  'Guerra de Corea': 'Korean War',
  'Guerra de Vietnam': 'Vietnam War',
  'Guerra de las Malvinas': 'Falklands War',
  'Guerra del Golfo': 'Gulf War',
  'Guerra de Iraq': 'Iraq War',
  'Guerra de Afganistán': 'Afghan War',
  'Guerra de Siria': 'Syrian War',
  'Guerra de Yemen': 'Yemen War',
  'Guerra de Ucrania': 'Ukraine War',
  'Conflicto Israel-Palestina': 'Israel-Palestine Conflict',
  'Guerra del Yom Kipur': 'Yom Kippur War',
  'Guerra de los Seis Días': 'Six-Day War',
  'Crisis de los Misiles': 'Missile Crisis',
  'Descolonización': 'Decolonization',
  'Guerras Africanas': 'African Wars',
  'Guerras Latinoamericanas': 'Latin American Wars',
  'Terrorismo': 'Terrorism',
  'Guerra contra el Terror': 'War on Terror',
  // Misc
  'Guerras Indias': 'Indian Wars',
  'Guerras Chino-Japonesas': 'Sino-Japanese Wars',
  'Revolución China': 'Chinese Revolution',
  'Revolución Rusa': 'Russian Revolution',
  'Revolución Francesa': 'French Revolution',
  'Guerras de la Independencia Americana': 'American Revolutionary War',
  'Guerra Civil Americana': 'American Civil War',
  'Guerra Civil Española': 'Spanish Civil War',
  'Guerras Balcánicas': 'Balkan Wars',
  'Primera Guerra Balcánica': 'First Balkan War',
  'Segunda Guerra Balcánica': 'Second Balkan War',
  'Guerra Ruso-Japonesa': 'Russo-Japanese War',
  'Guerra Ruso-Turca': 'Russo-Turkish War',
  'Guerra Anglo-Boer': 'Anglo-Boer War',
  'Guerra Hispano-Americana': 'Spanish-American War',
  'Guerras Opium': 'Opium Wars',
  'Rebelión Taiping': 'Taiping Rebellion',
  'Rebelión Bóxer': 'Boxer Rebellion',
  'Revolución Meiji': 'Meiji Restoration',
};

// Simple desc translator using word substitutions
function translateDesc(es) {
  let result = es;

  // Common full-phrase patterns first
  const PHRASES = [
    ['Primera victoria de Aníbal', 'Hannibal\'s first victory'],
    ['Primera derrota táctica de Aníbal', 'Hannibal\'s first tactical defeat'],
    ['Primera gran victoria naval de Roma', 'Rome\'s first great naval victory'],
    ['primera batalla naval', 'first naval battle'],
    ['primera gran batalla', 'first great battle'],
    ['primera derrota', 'first defeat'],
    ['primera victoria', 'first victory'],
    ['primera batalla campal', 'first pitched battle'],
    ['primera batalla documentada', 'first documented battle'],
    ['primera conquista imperial', 'first imperial conquest'],
    ['primera campaña militar', 'first military campaign'],
    ['nace el concepto de victoria pírrica', 'the concept of Pyrrhic victory is born'],
    ['obra maestra del envolvimiento', 'masterpiece of encirclement'],
    ['obra maestra táctica', 'tactical masterpiece'],
    ['nace el concepto', 'concept is born'],
    ['la mayor derrota', 'the greatest defeat'],
    ['la mayor batalla', 'the greatest battle'],
    ['la mayor victoria', 'the greatest victory'],
    ['la mayor potencia', 'the greatest power'],
    ['el mayor desastre', 'the greatest disaster'],
    ['el mayor ejército', 'the largest army'],
    ['la mayor flota', 'the largest fleet'],
    ['fin de la República Romana', 'end of the Roman Republic'],
    ['fin del Imperio Romano', 'end of the Roman Empire'],
    ['fin del Imperio Asirio', 'end of the Assyrian Empire'],
    ['fin de la Tercera Guerra Púnica', 'end of the Third Punic War'],
    ['fin de la Segunda Guerra Púnica', 'end of the Second Punic War'],
    ['fin de la Primera Guerra Púnica', 'end of the First Punic War'],
    ['nace la marina romana', 'the Roman navy is born'],
    ['destruye la flota', 'destroys the fleet'],
    ['destruye al ejército', 'destroys the army'],
    ['pasan bajo el yugo', 'pass under the yoke'],
    ['los pollos sagrados', 'sacred chickens'],
    ['culpan a los pollos sagrados', 'blame the sacred chickens'],
    ['2 legiones pasan bajo el yugo', '2 legions pass under the yoke'],
    ['legiones bajo el yugo', 'legions under the yoke'],
    ['caballería numídica decisiva', 'Numidian cavalry decisive'],
    ['caballería numídica', 'Numidian cavalry'],
    ['Corvus de abordaje', 'boarding Corvus'],
    ['Arquímedes y sus máquinas', 'Archimedes and his machines'],
    ['usa las tácticas de Aníbal contra él', 'uses Hannibal\'s tactics against him'],
    ['Paulo Emilio describe', 'Paulus Aemilius describes'],
    ['la cosa más aterradora', 'the most terrifying thing'],
    ['mercenario espartano', 'Spartan mercenary'],
    ['los hermanos Escipión', 'the Scipio brothers'],
    ['Escipión toma', 'Scipio captures'],
    ['Escipión expulsa', 'Scipio expels'],
    ['Escipión usa', 'Scipio uses'],
    ['Derrota definitiva de Aníbal', 'Definitive defeat of Hannibal'],
    ['Aníbal cruza los Alpes', 'Hannibal crosses the Alps'],
    ['Aníbal destruye', 'Hannibal destroys'],
    ['Segunda gran trampa de Aníbal', 'Hannibal\'s second great trap'],
    ['15.000 romanos masacrados en emboscada — el cónsul', '15,000 Romans massacred in ambush — consul'],
    ['70.000 romanos aniquilados — el envolvimiento perfecto que se estudia hoy', '70,000 Romans annihilated — the perfect encirclement still studied today'],
    ['80.000 seléucidas', '80,000 Seleucids'],
    ['Espartaco lidera', 'Spartacus leads'],
    ['la mayor revuelta de esclavos de Roma', 'the greatest slave revolt in Roman history'],
    ['César cruza el Rubicón', 'Caesar crosses the Rubicon'],
    ['comienza la guerra civil romana', 'the Roman civil war begins'],
    ['César derrota a Pompeyo', 'Caesar defeats Pompey'],
    ['Arminio destruye', 'Arminius destroys'],
    ['3 legiones romanas', '3 Roman legions'],
    ['Atila el Huno es detenido', 'Attila the Hun is stopped'],
    ['fin de las invasiones hunas en Europa', 'end of Hunnic invasions of Europe'],
    ['El Islam conquista', 'Islam conquers'],
    ['Bizancio pierde', 'Byzantium loses'],
    ['la caballería árabe', 'the Arab cavalry'],
    ['los polacos usan guerrilla', 'the Poles use guerrilla tactics'],
    ['primera batalla de tanques contra tanques', 'first tank-vs-tank battle'],
    ['primera batalla de tanques', 'first tank battle'],
    ['primera vez que los tanques', 'first time tanks'],
    ['carros de combate', 'tanks'],
    ['blitzkrieg', 'blitzkrieg'],
    ['retirada de Dunkerque', 'Dunkirk evacuation'],
    ['el menor de los males', 'the lesser of evils'],
    ['se estudia en las academias militares', 'still studied in military academies'],
    ['se estudia hoy', 'still studied today'],
    ['estudian hoy en las academias', 'studied today in military academies'],
  ];

  for (const [sp, en] of PHRASES) {
    const regex = new RegExp(sp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, en);
  }

  // Word-level substitutions
  for (const [sp, en] of Object.entries(WORD_MAP)) {
    const regex = new RegExp('\\b' + sp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    result = result.replace(regex, en);
  }

  // Number formatting: 1.000 → 1,000
  result = result.replace(/(\d)\.(\d{3})/g, '$1,$2');

  // Fix common Spanish articles/prepositions left over
  result = result
    .replace(/\ben el\b/g, 'in the')
    .replace(/\ben la\b/g, 'in the')
    .replace(/\ben los\b/g, 'in the')
    .replace(/\ben las\b/g, 'in the')
    .replace(/\ben su\b/g, 'in their')
    .replace(/\ben este\b/g, 'in this')
    .replace(/\bde la\b/g, 'of the')
    .replace(/\bdel\b/g, 'of the')
    .replace(/\bde los\b/g, 'of the')
    .replace(/\bde las\b/g, 'of the')
    .replace(/\bde su\b/g, 'of their')
    .replace(/\bpor la\b/g, 'by the')
    .replace(/\bpor el\b/g, 'by the')
    .replace(/\bpor los\b/g, 'by the')
    .replace(/\bcon la\b/g, 'with the')
    .replace(/\bcon el\b/g, 'with the')
    .replace(/\bcon los\b/g, 'with the')
    .replace(/\bpara la\b/g, 'for the')
    .replace(/\bpara el\b/g, 'for the')
    .replace(/\bque se\b/g, 'that')
    .replace(/\bque el\b/g, 'that the')
    .replace(/\bque la\b/g, 'that the')
    .replace(/\bun ejército\b/g, 'an army')
    .replace(/\buna flota\b/g, 'a fleet')
    .replace(/\buna victoria\b/g, 'a victory')
    .replace(/\buna derrota\b/g, 'a defeat');

  return result;
}

// ── Load existing data ──────────────────────────────────────

const descContent = fs.readFileSync(descFile, 'utf8');
const fullStart = descContent.indexOf('const FULL = {');
const fullEnd = descContent.indexOf('\n  }', fullStart);
const fullSection = descContent.slice(fullStart, fullEnd + 4);
const existingDescs = new Set();
for (const m of fullSection.matchAll(/'([^']+)':/g)) existingDescs.add(m[1]);

const transContent = fs.readFileSync(transFile, 'utf8');
const tagStart = transContent.indexOf('const TAG_EN = {');
const tagEnd = transContent.indexOf('\n}', tagStart);
const tagSection = transContent.slice(tagStart, tagEnd + 2);
const existingTags = new Set();
for (const m of tagSection.matchAll(/'([^']+)':/g)) existingTags.add(m[1]);

// ── Collect missing entries ─────────────────────────────────

const files = fs.readdirSync(eraDir).filter(f => f.endsWith('.ts'));
const missingDescs = new Map();
const missingTags = new Map();

for (const file of files) {
  const content = fs.readFileSync(path.join(eraDir, file), 'utf8');
  for (const m of content.matchAll(/desc:\s*'([^']+)'/g)) {
    if (!existingDescs.has(m[1])) missingDescs.set(m[1], translateDesc(m[1]));
  }
  for (const m of content.matchAll(/tag:\s*'([^']+)'/g)) {
    if (!existingTags.has(m[1])) {
      const en = TAG_TRANSLATIONS[m[1]] || m[1]; // fallback to same value
      missingTags.set(m[1], en);
    }
  }
}

console.log('Adding', missingDescs.size, 'desc entries');
console.log('Adding', missingTags.size, 'tag entries');

// ── Write to descTranslations.ts ───────────────────────────

function makeEntry(es, en) {
  const esSafe = es.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const enSafe = en.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `    '${esSafe}': '${enSafe}',\n`;
}

// Insert before the closing `  }` of FULL dict
let descNew = descContent;
const insertBefore = descNew.indexOf('\n  }', descNew.indexOf('const FULL = {'));
let descEntries = '';
for (const [es, en] of missingDescs) descEntries += makeEntry(es, en);
descNew = descNew.slice(0, insertBefore) + '\n' + descEntries + descNew.slice(insertBefore);
fs.writeFileSync(descFile, descNew);
console.log('Updated descTranslations.ts');

// ── Write to translations.ts TAG_EN ────────────────────────

let transNew = transContent;
const tagInsertBefore = transNew.indexOf('\n}', transNew.indexOf('const TAG_EN = {'));
let tagEntries = '';
for (const [es, en] of missingTags) tagEntries += `  '${es.replace(/'/g, "\\'")}': '${en.replace(/'/g, "\\'")}',\n`;
transNew = transNew.slice(0, tagInsertBefore) + '\n' + tagEntries + transNew.slice(tagInsertBefore);
fs.writeFileSync(transFile, transNew);
console.log('Updated translations.ts TAG_EN');
