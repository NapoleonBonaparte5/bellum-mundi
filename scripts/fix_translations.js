// Fix bad BATTLE_NAME_EN translations + DOC_NAME_EN missing entries
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../lib/i18n/translations.ts');
let src = fs.readFileSync(file, 'utf8');

// ── BATTLE_NAME_EN fixes: [bad value, correct value] ────────────────────────
// These are exact value-side replacements keyed by the Spanish key
const BATTLE_FIXES = [
  // Byzantine / Crusade
  ["  'Asedio de Constantinopla (Avar-Persa)': 'Siege of Constantinople (Avar-Persa)',", "  'Asedio de Constantinopla (Avar-Persa)': 'Siege of Constantinople (Avar-Persian)',"],
  ["  'Batalla de Nínive (Heraclio)': 'Battle of Nineveh (Heraclio)',", "  'Batalla de Nínive (Heraclio)': 'Battle of Nineveh (Heraclius)',"],
  ["  'Batalla del Campo de Sangre': 'Battle of the Campo de Sangre',", "  'Batalla del Campo de Sangre': 'Battle of the Field of Blood',"],
  ["  'Fracaso del Asedio de Damasco': 'Fracaso del Asedio de Damascus',", "  'Fracaso del Asedio de Damasco': 'Failed Siege of Damascus',"],
  ["  'Asedio de Ascalón': 'Siege of Ascalón',", "  'Asedio de Ascalón': 'Siege of Ashkelon',"],
  ["  'Caída de Jerusalén ante Saladino': 'Fall of Jerusalem ante Saladino',", "  'Caída de Jerusalén ante Saladino': 'Fall of Jerusalem to Saladin',"],
  ["  'Cruzada Albigense': 'Cruzada Albigense',", "  'Cruzada Albigense': 'Albigensian Crusade',"],
  ["  'Séptima Cruzada — Mansura': 'Seventh Cruzada — Mansura',", "  'Séptima Cruzada — Mansura': 'Seventh Crusade — Mansura',"],

  // Mongol
  ["  'Unificación Mongola por Gengis Kan': 'Unificación Mongola por Gengis Kan',", "  'Unificación Mongola por Gengis Kan': 'Mongol Unification by Genghis Khan',"],
  ["  'Invasión Mongola de China Jin': 'Mongol Invasion of China Jin',", "  'Invasión Mongola de China Jin': 'Mongol Invasion of Jin China',"],
  ["  'Caída de Zhongdu (Pekín)': 'Fall of Zhongdu (Pekín)',", "  'Caída de Zhongdu (Pekín)': 'Fall of Zhongdu (Beijing)',"],
  ["  'Invasión Mongola de Joresm': 'Mongol Invasion of Joresm',", "  'Invasión Mongola de Joresm': 'Mongol Invasion of Khwarezm',"],
  ["  'Batalla del Indo (Gengis Kan)': 'Battle of the Indo (Gengis Kan)',", "  'Batalla del Indo (Gengis Kan)': 'Battle of the Indus (Genghis Khan)',"],
  ["  'Batalla del Río Kalka': 'Battle of the Río Kalka',", "  'Batalla del Río Kalka': 'Battle of the Kalka River',"],
  ["  'Conquista del Imperio Xi Xia': 'Conquest of the Imperio Xi Xia',", "  'Conquista del Imperio Xi Xia': 'Conquest of the Xi Xia Empire',"],
  ["  'Caída de la Dinastía Jin': 'Fall of la Dinastía Jin',", "  'Caída de la Dinastía Jin': 'Fall of the Jin Dynasty',"],
  ["  'Primera Invasión Mongola de Japón': 'First Invasión Mongola de Japan',", "  'Primera Invasión Mongola de Japón': 'First Mongol Invasion of Japan',"],
  ["  'Segunda Invasión Mongola de Japón': 'Second Invasión Mongola de Japan',", "  'Segunda Invasión Mongola de Japón': 'Second Mongol Invasion of Japan',"],

  // Medieval European
  ["  'Anarquía en Inglaterra': 'Anarquía en Inglaterra',", "  'Anarquía en Inglaterra': 'The Anarchy (England)',"],
  ["  'Pérdida de Ierusalén por los Cruzados': 'Pérdida de Ierusalén por los Cruzados',", "  'Pérdida de Ierusalén por los Cruzados': 'Loss of Jerusalem by the Crusaders',"],
  ["  'Vísperas Sicilianas': 'Vísperas Sicilynas',", "  'Vísperas Sicilianas': 'Sicilian Vespers',"],
  ["  'Batalla del Río Maritza': 'Battle of the Río Maritza',", "  'Batalla del Río Maritza': 'Battle of the Maritsa River',"],
  ["  'Batallas Husitas — Vitkov y Vyšehrad': 'Batallas Husitas — Vitkov y Vyšehrad',", "  'Batallas Husitas — Vitkov y Vyšehrad': 'Hussite Battles — Vítkov and Vyšehrad',"],

  // Tang / Song / China
  ["  'Fundación del Imperio Tang': 'Foundation of the Imperio Tang',", "  'Fundación del Imperio Tang': 'Foundation of the Tang Empire',"],
  ["  'Campaña de Xuanzang — India': 'Campaign of Xuanzang — India',", "  'Campaña de Xuanzang — India': 'Xuanzang Campaign — India',"],
  ["  'Campaña de Tang Taizong en Corea': 'Campaign of Tang Taizong en Korea',", "  'Campaña de Tang Taizong en Corea': 'Tang Taizong Campaign in Korea',"],
  ["  'Conquista Tang de Baekje': 'Conquista Tang de Baekje',", "  'Conquista Tang de Baekje': 'Tang Conquest of Baekje',"],
  ["  'Batalla de Talas vs Árabes': 'Battle of Talas vs Árabes',", "  'Batalla de Talas vs Árabes': 'Battle of Talas vs Arabs',"],
  ["  'Colapso del Imperio Tang': 'Colapso del Imperio Tang',", "  'Colapso del Imperio Tang': 'Collapse of the Tang Empire',"],
  ["  'Unificación Song de China': 'Unificación Song de China',", "  'Unificación Song de China': 'Song Unification of China',"],
  ["  'Paz del Shanyuan': 'Paz del Shanyuan',", "  'Paz del Shanyuan': 'Peace of Shanyuan',"],
  ["  'Destrucción del Imperio Liao': 'Destruction of the Imperio Liao',", "  'Destrucción del Imperio Liao': 'Destruction of the Liao Empire',"],
  ["  'Captura del Emperador Song por Jin': 'Capture of the Emperador Song por Jin',", "  'Captura del Emperador Song por Jin': 'Capture of the Song Emperor by Jin',"],
  ["  'Campaña de Gengis en Asia Central': 'Campaign of Gengis en Asia Central',", "  'Campaña de Gengis en Asia Central': 'Genghis Khan Campaign in Central Asia',"],
  ["  'Guerra Genpei': 'Guerra Genpei',", "  'Guerra Genpei': 'Genpei War',"],

  // Early Modern
  ["  'Milagro de la Casa de Brandeburgo': 'Miracle of the Casa de Brandeburgo',", "  'Milagro de la Casa de Brandeburgo': 'Miracle of the House of Brandenburg',"],
  ["  'Campaña del Rin — Mainz': 'Campaign of the Rin — Mainz',", "  'Campaña del Rin — Mainz': 'Rhine Campaign — Mainz',"],
  ["  'Batalla del Nilo (Abukir I)': 'Battle of the Nilo (Abukir I)',", "  'Batalla del Nilo (Abukir I)': 'Battle of the Nile (Aboukir I)',"],
  ["  'Campaña de los Seis Días': 'Campaign of los Seis Días',", "  'Campaña de los Seis Días': 'Six Days Campaign',"],
  ["  'Cruce de los Andes de San Martín': 'Crossing of los Andes de San Martín',", "  'Cruce de los Andes de San Martín': 'San Martín\\'s Crossing of the Andes',"],
  ["  'Batalla del Cabo (Sudáfrica)': 'Battle of the Cabo (Sudáfrica)',", "  'Batalla del Cabo (Sudáfrica)': 'Battle of the Cape (South Africa)',"],

  // Prehistoric / Ancient (auto-translated badly)
  ["  'Conflictos del Natufiense': 'Conflicts of the Natufiense',", "  'Conflictos del Natufiense': 'Natufian Culture Conflicts',"],
  ["  'Conflictos del Valle del Indo Temprano': 'Conflicts of the Valle del Indo Temprano',", "  'Conflictos del Valle del Indo Temprano': 'Early Indus Valley Conflicts',"],
  ["  'Batalla de la Cultura Lepenski Vir': 'Battle of the Cultura Lepenski Vir',", "  'Batalla de la Cultura Lepenski Vir': 'Lepenski Vir Culture Battle',"],
  ["  'Conflictos de la Cultura Hassuna': 'Conflicts of la Cultura Hassuna',", "  'Conflictos de la Cultura Hassuna': 'Hassuna Culture Conflicts',"],
  ["  'Conflictos de la Cultura de Trichterbecker': 'Conflicts of la Cultura de Trichterbecker',", "  'Conflictos de la Cultura de Trichterbecker': 'Trichterbecker Culture Conflicts',"],
  ["  'Batalla de la Cultura de Michelsberger': 'Battle of the Cultura de Michelsberger',", "  'Batalla de la Cultura de Michelsberger': 'Michelsberger Culture Battle',"],
  ["  'Conflictos Calcolíticos de Iberia': 'Conflictos Calcolíticos de Iberia',", "  'Conflictos Calcolíticos de Iberia': 'Chalcolithic Iberian Conflicts',"],
  ["  'Conflictos de Uruk Tardío': 'Conflicts of Uruk Tardío',", "  'Conflictos de Uruk Tardío': 'Late Uruk Conflicts',"],
  ["  'Batalla del Hombre de Similaun': 'Battle of the Hombre de Similaun',", "  'Batalla del Hombre de Similaun': 'Battle of the Iceman (Similaun)',"],
  ["  'Unificación de Egipto por Narmer': 'Unification of Egypt por Narmer',", "  'Unificación de Egipto por Narmer': 'Unification of Egypt by Narmer',"],
  ["  'Conquistas de la Cultura Ghassul': 'Conquistas de la Cultura Ghassul',", "  'Conquistas de la Cultura Ghassul': 'Ghassul Culture Conquests',"],
  ["  'Guerras Cananeas Tempranas': 'Guerras Cananeas Tempranas',", "  'Guerras Cananeas Tempranas': 'Early Canaanite Wars',"],
  ["  'Conflictos de la Cultura Yamnaya': 'Conflicts of la Cultura Yamnaya',", "  'Conflictos de la Cultura Yamnaya': 'Yamnaya Culture Conflicts',"],
  ["  'Conflictos de la Cultura Corded Ware': 'Conflicts of la Cultura Corded Ware',", "  'Conflictos de la Cultura Corded Ware': 'Corded Ware Culture Conflicts',"],
  ["  'Expansión del Hacha de Batalla Corded Ware': 'Expansión del Hacha de Batalla Corded Ware',", "  'Expansión del Hacha de Batalla Corded Ware': 'Corded Ware Battle Axe Expansion',"],
  ["  'Guerras de Lagash y Umma — Primer Conflicto': 'Wars of Lagash y Umma — Primer Conflicto',", "  'Guerras de Lagash y Umma — Primer Conflicto': 'Wars of Lagash and Umma — First Conflict',"],
  ["  'Conflicto de Stonehenge': 'Conflicto de Stonehenge',", "  'Conflicto de Stonehenge': 'Stonehenge Conflict',"],
  ["  'Guerras de la Cultura Campaniforme': 'Wars of la Cultura Campaniforme',", "  'Guerras de la Cultura Campaniforme': 'Bell Beaker Culture Wars',"],
  ["  'Conflictos del Delta del Nilo': 'Conflicts of the Delta del Nilo',", "  'Conflictos del Delta del Nilo': 'Nile Delta Conflicts',"],
  ["  'Conflictos Prehistóricos de China': 'Conflictos Prehistóricos de China',", "  'Conflictos Prehistóricos de China': 'Prehistoric China Conflicts',"],
  ["  'Destrucción del Bronce Antiguo III': 'Destruction of the Bronce Antiguo III',", "  'Destrucción del Bronce Antiguo III': 'Early Bronze Age III Destruction',"],
  ["  'Invasión de los Gutis': 'Invasion of los Gutis',", "  'Invasión de los Gutis': 'Gutian Invasion',"],
  ["  'Conflictos del Colapso del Viejo Imperio Egipcio': 'Conflicts of the Colapso del Viejo Imperio Egipcio',", "  'Conflictos del Colapso del Viejo Imperio Egipcio': 'Old Kingdom Collapse Conflicts',"],
  ["  'Guerras del Periodo Intermedio Egipcio': 'Wars of the Periodo Intermedio Egipcio',", "  'Guerras del Periodo Intermedio Egipcio': 'Egyptian Intermediate Period Wars',"],
  ["  'Reconquista Sumeria de Mesopotamia': 'Reconquista Sumeria de Mesopotamia',", "  'Reconquista Sumeria de Mesopotamia': 'Sumerian Reconquest of Mesopotamia',"],
  ["  'Guerras de Ur III vs Nómadas del Este': 'Wars of Ur III vs Nómadas del Este',", "  'Guerras de Ur III vs Nómadas del Este': 'Ur III Wars vs Eastern Nomads',"],
  ["  'Guerras del Río Tigris': 'Wars of the Río Tigris',", "  'Guerras del Río Tigris': 'Tigris River Wars',"],
  ["  'Conflictos de la Creta Minoica Temprana': 'Conflicts of la Crete Minoica Temprana',", "  'Conflictos de la Creta Minoica Temprana': 'Early Minoan Crete Conflicts',"],
  ["  'Invasión Amorita de Mesopotamia': 'Invasión Amorita de Mesopotamia',", "  'Invasión Amorita de Mesopotamia': 'Amorite Invasion of Mesopotamia',"],
  ["  'Conflictos de la Cultura Harappan': 'Conflicts of la Cultura Harappan',", "  'Conflictos de la Cultura Harappan': 'Harappan Culture Conflicts',"],
  ["  'Guerras del Delta del Nilo Tardío': 'Wars of the Delta del Nilo Tardío',", "  'Guerras del Delta del Nilo Tardío': 'Late Nile Delta Wars',"],
  ["  'Campañas de la Cultura Badari': 'Campaigns of la Cultura Badari',", "  'Campañas de la Cultura Badari': 'Badari Culture Campaigns',"],

  // WWI
  ["  'Carrera al Mar': 'Carrera al Mar',", "  'Carrera al Mar': 'Race to the Sea',"],
  ["  'Batalla de los Lagos Masurianos': 'Battle of the Lagos Masurianos',", "  'Batalla de los Lagos Masurianos': 'Battle of the Masurian Lakes',"],
  ["  'Batalla de Przemyśl (sitio)': 'Battle of Przemyśl (sitio)',", "  'Batalla de Przemyśl (sitio)': 'Siege of Przemyśl',"],
  ["  'Batalla de las Islas Falkland': 'Battle of the Islas Falkland',", "  'Batalla de las Islas Falkland': 'Battle of the Falkland Islands',"],
  ["  'Batalla de Artois (mayo)': 'Battle of Artois (mayo)',", "  'Batalla de Artois (mayo)': 'Battle of Artois (May)',"],
  ["  'Batalla de Champagne (otoño)': 'Battle of Champagne (otoño)',", "  'Batalla de Champagne (otoño)': 'Battle of Champagne (Autumn)',"],
  ["  'Batalla de Gallipoli — Desembarco en Anzac': 'Battle of Gallipoli — Desembarco en Anzac',", "  'Batalla de Gallipoli — Desembarco en Anzac': 'Battle of Gallipoli — ANZAC Landing',"],
  ["  'Batalla de Gallipoli — Desembarco en Cabo Helles': 'Battle of Gallipoli — Desembarco en Cabo Helles',", "  'Batalla de Gallipoli — Desembarco en Cabo Helles': 'Battle of Gallipoli — Cape Helles Landing',"],
  ["  'Gran Ofensiva Alemana en el Este (Gorlice-Tarnow)': 'Great Offensive Alemana en el Este (Gorlice-Tarnow)',", "  'Gran Ofensiva Alemana en el Este (Gorlice-Tarnow)': 'Great German Offensive in the East (Gorlice-Tarnow)',"],
  ["  'Campaña de Mesopotamia — Batalla de Ctesifonte': 'Campaign of Mesopotamia — Batalla de Ctesifonte',", "  'Campaña de Mesopotamia — Batalla de Ctesifonte': 'Mesopotamia Campaign — Battle of Ctesiphon',"],
  ["  'Campaña de Egipto — Batalla de Romani': 'Campaign of Egypt — Batalla de Romeni',", "  'Campaña de Egipto — Batalla de Romani': 'Egypt Campaign — Battle of Romani',"],
  ["  'Batalla del Isonzo (serie)': 'Battle of the Isonzo (serie)',", "  'Batalla del Isonzo (serie)': 'Battle of the Isonzo (series)',"],
  ["  'Asalto a la Cresta de Vimy': 'Assault on la Cresta de Vimy',", "  'Asalto a la Cresta de Vimy': 'Assault on Vimy Ridge',"],
  ["  'Ofensiva Kerensky (Ofensiva de julio)': 'Offensive Kerensky (Ofensiva de julio)',", "  'Ofensiva Kerensky (Ofensiva de julio)': 'Kerensky Offensive (July Offensive)',"],
  ["  'Operación Michael — Ofensiva del Kaiser': 'Operation Michael — Ofensiva del Kaiser',", "  'Operación Michael — Ofensiva del Kaiser': \"Operation Michael — Kaiser's Offensive\","],
  ["  'Batalla de Amiens — El Día Negro': 'Battle of Amiens — El Día Negro',", "  'Batalla de Amiens — El Día Negro': 'Battle of Amiens — The Black Day',"],
  ["  'Ofensiva Mosa-Argona': 'Offensive Mosa-Argona',", "  'Ofensiva Mosa-Argona': 'Meuse-Argonne Offensive',"],
  ["  'Guerra Submarina sin Restricciones': 'Guerra Submarina sin Restricciones',", "  'Guerra Submarina sin Restricciones': 'Unrestricted Submarine Warfare',"],
  ["  'Batalla del Mar del Norte (Skagerrak)': 'Battle of the Mar del Norte (Skagerrak)',", "  'Batalla del Mar del Norte (Skagerrak)': 'Battle of the North Sea (Skagerrak)',"],
  ["  'Batalla Aérea del Somme — \"Semana Sangrienta\"': 'Batalla Aérea del Somme — \"Semana Sangrienta\"',", "  'Batalla Aérea del Somme — \"Semana Sangrienta\"': 'Aerial Battle of the Somme — \"Bloody Week\"',"],
  ["  'Bloody April — Frente Aéreo de Arras': 'Bloody April — Frente Aéreo de Arras',", "  'Bloody April — Frente Aéreo de Arras': 'Bloody April — Arras Aerial Front',"],
  ["  'Campaña del Sinaí y Palestina': 'Campaign of the Sinai y Palestine',", "  'Campaña del Sinaí y Palestina': 'Sinai and Palestine Campaign',"],
  ["  'Batalla de Megido (Armagedón)': 'Battle of Megiddo (Armagedón)',", "  'Batalla de Megido (Armagedón)': 'Battle of Megiddo (Armageddon)',"],
  ["  'Campaña de Africa Oriental — Von Lettow-Vorbeck': 'Campaign of Africa Oriental — Von Lettow-Vorbeck',", "  'Campaña de Africa Oriental — Von Lettow-Vorbeck': 'East Africa Campaign — Von Lettow-Vorbeck',"],
  ["  'Batalla de Togo — Campaña de Kamerun': 'Battle of Togo — Campaña de Kamerun',", "  'Batalla de Togo — Campaña de Kamerun': 'Battle of Togo — Kamerun Campaign',"],
  ["  'Segunda Batalla del Marne — Contraataque': 'Second Battle of the Marne — Contraataque',", "  'Segunda Batalla del Marne — Contraataque': 'Second Battle of the Marne — Counterattack',"],
  ["  'Campaña de Salónica': 'Campaign of Salónica',", "  'Campaña de Salónica': 'Salonika Campaign',"],
  ["  'Bombardeos Zeppelin sobre Londres': 'Bombing Zeppelin sobre London',", "  'Bombardeos Zeppelin sobre Londres': 'Zeppelin Bombing of London',"],
  ["  'Genocidio Armenio — Batalla de Van': 'Armenian Genocide — Batalla de Van',", "  'Genocidio Armenio — Batalla de Van': 'Armenian Genocide — Battle of Van',"],
  ["  'Campaña del Cáucaso — Batalla de Erzurum': 'Campaign of the Cáucaso — Batalla de Erzurum',", "  'Campaña del Cáucaso — Batalla de Erzurum': 'Caucasus Campaign — Battle of Erzurum',"],
  ["  'Tratado de Brest-Litovsk y frente ucraniano': 'Treaty of Brest-Litovsk y frente ucraniano',", "  'Tratado de Brest-Litovsk y frente ucraniano': 'Treaty of Brest-Litovsk and Ukrainian Front',"],
  ["  'Bombardeo de Scarborough y Hartlepool': 'Bombing of Scarborough y Hartlepool',", "  'Bombardeo de Scarborough y Hartlepool': 'Bombing of Scarborough and Hartlepool',"],
  ["  'Batalla del Golfo de Riga': 'Battle of the Golfo de Riga',", "  'Batalla del Golfo de Riga': 'Battle of the Gulf of Riga',"],
  ["  'Operación Hush — Proyecto de desembarco en Bélgica': 'Operation Hush — Proyecto de desembarco en Bélgica',", "  'Operación Hush — Proyecto de desembarco en Bélgica': 'Operation Hush — Belgian Landing Project',"],
  ["  'Primera Batalla de Tanques vs. Tanques': 'First Battle of Tanques vs. Tanques',", "  'Primera Batalla de Tanques vs. Tanques': 'First Tank vs. Tank Battle',"],
  ["  'Batalla del Río de la Plata': 'Battle of the Río de la Plata',", "  'Batalla del Río de la Plata': 'Battle of the River Plate',"],

  // WWII
  ["  'Guerra de Invierno (Finlandia)': 'War of Invierno (Finland)',", "  'Guerra de Invierno (Finlandia)': 'Winter War (Finland)',"],
  ["  'Invasión de Francia y los Países Bajos': 'Invasion of France y los Netherlands',", "  'Invasión de Francia y los Países Bajos': 'Invasion of France and the Low Countries',"],
  ["  'Evacuación de Dunkerque': 'Evacuation of Dunkerque',", "  'Evacuación de Dunkerque': 'Evacuation of Dunkirk',"],
  ["  'Batalla de Francia — Caída de París': 'Battle of France — Caída de Paris',", "  'Batalla de Francia — Caída de París': 'Battle of France — Fall of Paris',"],
  ["  'Batalla de Gran Bretaña': 'Battle of Gran Bretaña',", "  'Batalla de Gran Bretaña': 'Battle of Britain',"],
  ["  'Invasión de Noruega y Dinamarca': 'Invasion of Norway y Denmark',", "  'Invasión de Noruega y Dinamarca': 'Invasion of Norway and Denmark',"],
  ["  'Operación Compass — Norte de África': 'Operation Compass — Norte de África',", "  'Operación Compass — Norte de África': 'Operation Compass — North Africa',"],
  ["  'Campaña de Africa — Rommel en Cyrenaica': 'Campaign of Africa — Rommel en Cyrenaica',", "  'Campaña de Africa — Rommel en Cyrenaica': 'Africa Campaign — Rommel in Cyrenaica',"],
  ["  'Batalla de El Alamein (Primera)': 'Battle of El Alamein (Primera)',", "  'Batalla de El Alamein (Primera)': 'Battle of El Alamein (First)',"],
  ["  'Batalla de El Alamein (Segunda)': 'Battle of El Alamein (Segunda)',", "  'Batalla de El Alamein (Segunda)': 'Battle of El Alamein (Second)',"],
  ["  'Caída de Túnez — Fin de la campaña africana': 'Fall of Tunisia — Fin de la campaña africana',", "  'Caída de Túnez — Fin de la campaña africana': 'Fall of Tunisia — End of the African Campaign',"],
  ["  'Operación Barbarroja — Invasión de la URSS': 'Operation Barbarroja — Invasión de la URSS',", "  'Operación Barbarroja — Invasión de la URSS': 'Operation Barbarossa — Invasion of the USSR',"],
  ["  'Batalla por Berlín': 'Batalla por Berlin',", "  'Batalla por Berlín': 'Battle for Berlin',"],
  ["  'Desembarco de Normandía — Día D': 'Landing of Normandy — Día D',", "  'Desembarco de Normandía — Día D': 'Normandy Landing — D-Day',"],
  ["  'Operación Cobra y Falaise': 'Operation Cobra y Falaise',", "  'Operación Cobra y Falaise': 'Operation Cobra and Falaise',"],
  ["  'Desembarco en Sicilia (Operación Husky)': 'Landing in Sicily (Operación Husky)',", "  'Desembarco en Sicilia (Operación Husky)': 'Landing in Sicily (Operation Husky)',"],
  ["  'Desembarco de Anzio': 'Landing of Anzio',", "  'Desembarco de Anzio': 'Landing at Anzio',"],
  ["  'Operación Diadema — Ruptura de la Línea Gustav': 'Operation Diadema — Ruptura de la Línea Gustav',", "  'Operación Diadema — Ruptura de la Línea Gustav': 'Operation Diadem — Breaking the Gustav Line',"],
  ["  'Caída de Singapur': 'Fall of Singapur',", "  'Caída de Singapur': 'Fall of Singapore',"],
  ["  'Batalla del Mar de Coral': 'Battle of the Mar de Coral',", "  'Batalla del Mar de Coral': 'Battle of the Coral Sea',"],
  ["  'Batalla del Mar de Filipinas': 'Battle of the Mar de Philippines',", "  'Batalla del Mar de Filipinas': 'Battle of the Philippine Sea',"],
  ["  'Batalla del Golfo de Leyte': 'Battle of the Golfo de Leyte',", "  'Batalla del Golfo de Leyte': 'Battle of Leyte Gulf',"],
  ["  'Bombardeos de Tokio': 'Bombing de Tokio',", "  'Bombardeos de Tokio': 'Bombing of Tokyo',"],
  ["  'Invasión de la URSS — Caso Azul (Cáucaso)': 'Invasion of la URSS — Caso Azul (Cáucaso)',", "  'Invasión de la URSS — Caso Azul (Cáucaso)': 'Invasion of the USSR — Case Blue (Caucasus)',"],
  ["  'Levantamiento del Gueto de Varsovia': 'Uprising of the Gueto de Warsaw',", "  'Levantamiento del Gueto de Varsovia': 'Warsaw Ghetto Uprising',"],
  ["  'Bombardeo de Hamburgo (Operación Gomorrah)': 'Bombing of Hamburg (Operación Gomorrah)',", "  'Bombardeo de Hamburgo (Operación Gomorrah)': 'Bombing of Hamburg (Operation Gomorrah)',"],
  ["  'Operación Pointblank — Semana Decisiva': 'Operation Pointblank — Semana Decisiva',", "  'Operación Pointblank — Semana Decisiva': 'Operation Pointblank — Big Week',"],
  ["  'Batalla del Cabo Matapán': 'Battle of the Cabo Matapán',", "  'Batalla del Cabo Matapán': 'Battle of Cape Matapan',"],
  ["  'Operación Pedestal — Convoy a Malta': 'Operation Pedestal — Convoy a Malta',", "  'Operación Pedestal — Convoy a Malta': 'Operation Pedestal — Convoy to Malta',"],
  ["  'Operación Crusader — Norte de África': 'Operation Crusader — Norte de África',", "  'Operación Crusader — Norte de África': 'Operation Crusader — North Africa',"],
  ["  'Declaración de guerra soviética a Japón': 'Declaration of guerra soviética a Japan',", "  'Declaración de guerra soviética a Japón': 'Soviet Declaration of War on Japan',"],
];

let count = 0;
for (const [oldLine, newLine] of BATTLE_FIXES) {
  if (src.includes(oldLine)) {
    src = src.replace(oldLine, newLine);
    count++;
  } else {
    console.warn('NOT FOUND:', oldLine.substring(0, 80));
  }
}
console.log(`Applied ${count}/${BATTLE_FIXES.length} BATTLE_NAME_EN fixes`);

// ── Remove misplaced battle entries from DOC_NAME_EN (lines 2480-2513 area) ─
// These correct translations were accidentally added to DOC_NAME_EN by add_translations.js
const MISPLACED_IN_DOC = [
  "  'Conflictos de la Cultura Yamnaya': 'Yamnaya Culture Conflicts',\n",
  "  'Conflictos de la Cultura Corded Ware': 'Corded Ware Culture Conflicts',\n",
  "  'Expansión del Hacha de Batalla Corded Ware': 'Corded Ware Battle Axe Expansion',\n",
  "  'Batalla de Kish vs Uruk': 'Battle of Kish vs Uruk',\n",
  "  'Guerras de Lagash y Umma — Primer Conflicto': 'Wars of Lagash and Umma — First Conflict',\n",
  "  'Conquista de Ebla': 'Conquest of Ebla',\n",
  "  'Guerras Acadias Tempranas': 'Early Akkadian Wars',\n",
  "  'Conflicto de Stonehenge': 'Stonehenge Conflict',\n",
  "  'Guerras de la Cultura Campaniforme': 'Bell Beaker Culture Wars',\n",
  "  'Guerras de Lagash y Umma': 'Wars of Lagash and Umma',\n",
  "  'Conflictos del Delta del Nilo': 'Nile Delta Conflicts',\n",
  "  'Conflictos Prehistóricos de China': 'Prehistoric China Conflicts',\n",
  "  'Destrucción del Bronce Antiguo III': 'Early Bronze Age III Destruction',\n",
  "  'Invasión de los Gutis': 'Gutian Invasion',\n",
  "  'Conflictos del Colapso del Viejo Imperio Egipcio': 'Old Kingdom Collapse Conflicts',\n",
  "  'Guerras del Periodo Intermedio Egipcio': 'Egyptian Intermediate Period Wars',\n",
  "  'Reconquista Sumeria de Mesopotamia': 'Sumerian Reconquest of Mesopotamia',\n",
  "  'Guerras de Ur III vs Nómadas del Este': 'Ur III Wars vs Eastern Nomads',\n",
  "  'Guerras del Río Tigris': 'Tigris River Wars',\n",
  "  'Conflictos de la Creta Minoica Temprana': 'Early Minoan Crete Conflicts',\n",
  "  'Invasión Amorita de Mesopotamia': 'Amorite Invasion of Mesopotamia',\n",
  "  'Conflictos de la Cultura Harappan': 'Harappan Culture Conflicts',\n",
  "  'Guerras del Delta del Nilo Tardío': 'Late Nile Delta Wars',\n",
  "  'Campañas de la Cultura Badari': 'Badari Culture Campaigns',\n",
  "  // Ancient docs missing\n",
];
let removed = 0;
// Only remove entries that are inside the DOC_NAME_EN section
const docStart = src.indexOf('const DOC_NAME_EN = {');
const docEnd = src.indexOf('\n}', docStart);
let docSection = src.slice(docStart, docEnd + 2);
for (const entry of MISPLACED_IN_DOC) {
  if (docSection.includes(entry)) {
    docSection = docSection.replace(entry, '');
    removed++;
  }
}
src = src.slice(0, docStart) + docSection + src.slice(docEnd + 2);
console.log(`Removed ${removed} misplaced entries from DOC_NAME_EN`);

// ── Add correct DOC_NAME_EN entries with exact keys matching era files ────────
const DOC_ADDITIONS = `  // WWII docs — correct keys matching era data files
  'Conferencia de Yalta': 'Yalta Conference',
  'Conferencia de Potsdam': 'Potsdam Conference',
  'Rendición de Alemania (VE-Day)': 'German Surrender (VE-Day)',
  'Rendición de Japón (VJ-Day)': 'Japanese Surrender (VJ-Day)',
  'Juicios de Núremberg': 'Nuremberg Trials',
  'Plan Marshall': 'Marshall Plan',
  'Creación de la ONU': 'Creation of the United Nations',
  'Convenios de Ginebra (revisión)': 'Geneva Conventions (revision)',
`;

// Insert before the closing } of DOC_NAME_EN
const docCloseMarker = "'Textos de Ebla sobre Guerras': 'Ebla Texts on Wars',\n  'Lista Real Sumeria': 'Sumerian King List',\n}";
const newDocClose = "'Textos de Ebla sobre Guerras': 'Ebla Texts on Wars',\n  'Lista Real Sumeria': 'Sumerian King List',\n" + DOC_ADDITIONS + "}";
if (src.includes(docCloseMarker)) {
  src = src.replace(docCloseMarker, newDocClose);
  console.log('Added DOC_NAME_EN entries');
} else {
  console.warn('DOC_NAME_EN close marker not found');
}

fs.writeFileSync(file, src, 'utf8');
console.log('Done. translations.ts updated.');
