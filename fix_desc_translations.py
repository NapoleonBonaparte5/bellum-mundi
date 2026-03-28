"""
Fix 39 corrupt entries in lib/i18n/descTranslations.ts
Each corrupt entry has the wrong English value (word-by-word fallback garbage).
We replace only the VALUE (the English string) for each known Spanish key.
"""

import re

FILE = 'lib/i18n/descTranslations.ts'

CORRECTIONS = {
    'Heridas de armas en esqueletos natufienses — violencia intergrupal documentada':
        'Weapon wounds on Natufian skeletons — documented intergroup violence',
    'Evidencias de violencia sistemática en la primera aldea permanente conocida':
        'Evidence of systematic violence in the earliest known permanent village',
    'Asentamientos con empalizadas en el proto-Harappa muestran conflicto':
        'Proto-Harappan settlements with defensive palisades show evidence of conflict',
    'Primera ciudad amurallada con evidencias de conflicto armado organizado':
        'First walled city with evidence of organized armed conflict',
    'Primeras murallas defensivas en el norte de Mesopotamia':
        'First defensive walls in northern Mesopotamia',
    '34 individuos masacrados con hachas — evidencia de guerra entre asentamientos':
        '34 individuals massacred with axes — evidence of warfare between settlements',
    '67 esqueletos con signos de violencia — fin violento de un asentamiento neolítico':
        '67 skeletons with signs of violence — violent end of a Neolithic settlement',
    'Causewayed camps con evidencias de asedio y masacre colectiva':
        'Causewayed camps with evidence of siege and mass massacre',
    'Grandes asentamientos defensivos en Ucrania occidental quemados violentamente':
        'Large defensive settlements in western Ukraine violently burned',
    'Asentamientos con empalizada doble y señales de ataque':
        'Settlements with double palisades and clear signs of attack',
    'Primeras evidencias de caballería en combate en las estepas pónticas':
        'First evidence of cavalry in combat on the Pontic steppes',
    'Unificación violenta del Valle del Nilo — combate entre ciudades del Nilo':
        'Violent unification of the Nile Valley — warfare between Nile cities',
    'Primera expansión colonial urbana con evidencias de violencia':
        'First urban colonial expansion with evidence of violence',
    'Primera campaña militar iconográficamente documentada de la historia':
        'First iconographically documented military campaign in history',
    'Expansión violenta documentada genéticamente — reemplazo poblacional en Europa':
        'Violent expansion genetically documented — population replacement across Europe',
    'Expansión violenta con flechas de bronce documentada arqueológicamente':
        'Violent expansion with bronze arrows archaeologically documented',
    'Expansión de los pueblos del hacha de batalla por Europa del Norte':
        'Expansion of the Battle Axe peoples across Northern Europe',
    'Primera disputa territorial documentada por canales de irrigación':
        'First documented territorial dispute over irrigation canals',
    'Evidencias de violencia en las poblaciones que construyeron Stonehenge':
        'Evidence of violence among the populations that built Stonehenge',
    'Expansión campaniforme con evidencias de violencia intergrupal':
        'Bell Beaker expansion with evidence of intergroup violence',
    'Evidencias de violencia masiva en la transición al Estado en China':
        'Evidence of mass violence during the transition to statehood in China',
    'Primeras evidencias de conflicto y murallas en los palacios minoicos':
        'First evidence of conflict and walls in Minoan palaces',
    'Expansión territorial de las culturas predinásticas del Alto Nilo':
        'Territorial expansion of Pre-Dynastic cultures of the Upper Nile',
    'Mayor victoria romana sobre los Godos — 50.000 godos muertos':
        'Greatest Roman victory over the Goths — 50,000 Goths killed',
    'Teodosio vence con los Godos — última batalla de un Imperio unificado':
        'Theodosius defeats with Gothic allies — last battle of a unified Empire',
    'Los Hunos destruyen el reino godo del Ponto — domino de las estepas':
        'The Huns destroy the Gothic kingdom of Pontus — steppe domination begins',
    '20 años de guerra devastan Italia — fin del reino ostrogodo':
        '20 years of war devastate Italy — end of the Ostrogothic kingdom',
    'Carlos Martel detiene la expansión islámica en Europa':
        'Charles Martel halts the Islamic expansion into Europe',
    'Bizancio recupera el ritmo — inicio de la expansión macedónica':
        'Byzantium regains momentum — beginning of the Macedonian expansion',
    'El mayor desastre de la civilización islámica medieval':
        'The greatest disaster of medieval Islamic civilization',
    'EE.UU. pierde su primera guerra — fin de la era colonial':
        'The USA loses its first war — end of the colonial era',
    'Francia humillada — fin del colonialismo francés en Asia':
        'France humiliated — end of French colonialism in Asia',
    'Inicio del conflicto colonial en América del Norte':
        'Beginning of the colonial conflict in North America',
    'EE.UU. y URSS frenan a las potencias coloniales':
        'The USA and USSR rein in the colonial powers',
    'EE.UU. pierde su primera guerra — fin de la era colonial francesa en Vietnam':
        'The USA loses its war — end of the French colonial era in Vietnam',
    'La secesión de Biafra en Nigeria lleva a 3 años de guerra. Hambruna usada como arma. 1-3 millones de muertos. Fin de la ilusión de África postcolonial pacífica.':
        'The Biafran secession in Nigeria leads to 3 years of war. Famine weaponized. 1-3 million dead. End of the illusion of a peaceful post-colonial Africa.',
    'Los conquistadores se rebelan contra las Nuevas Leyes — guerra civil en el Perú':
        'The conquistadors rebel against the New Laws — civil war in Peru',
    'Primera batalla naval donde los barcos principales nunca se ven. Solo aviones embarcados luchan. Empate táctico pero victoria estratégica americana al bloquear la expansión japonesa.':
        'First naval battle where the main ships never sight each other. Only carrier aircraft fight. Tactical draw but strategic American victory, blocking Japanese expansion.',
}

with open(FILE, encoding='utf-8') as f:
    content = f.read()

count = 0
for es_key, correct_en in CORRECTIONS.items():
    # Escape the key for use in regex
    escaped_key = re.escape(es_key)
    # Match: 'ES_KEY': 'ANYTHING_HERE'  (single quotes)
    # or    'ES_KEY': "ANYTHING_HERE"   (double quotes on value)
    pattern = r"('" + escaped_key + r"'\s*:\s*)'[^']*'"
    replacement = r"\g<1>'" + correct_en.replace("'", "\\'") + "'"
    new_content, n = re.subn(pattern, replacement, content)
    if n > 0:
        content = new_content
        count += 1
        print(f"  OK: {es_key[:60]}...")
    else:
        # Try with double quotes on key
        pattern2 = r'("' + escaped_key + r'"\s*:\s*)"[^"]*"'
        replacement2 = r'\g<1>"' + correct_en + '"'
        new_content2, n2 = re.subn(pattern2, replacement2, content)
        if n2 > 0:
            content = new_content2
            count += 1
            print(f"  OK (dq): {es_key[:60]}...")
        else:
            print(f"  MISS: {es_key[:60]}...")

print(f"\nTotal fixed: {count}/{len(CORRECTIONS)}")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("File written.")
