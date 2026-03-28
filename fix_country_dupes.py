# Fix self-mapping duplicate entries in COUNTRY_EN that override correct translations
# These were legacy entries from previous sessions where Spanish strings were mapped to themselves

FIXES = {
    # These entries appear later in COUNTRY_EN and override correct translations added earlier
    "'Vénetos': 'Vénetos'": "'Vénetos': 'Veneti'",
    "'Vercingetórix': 'Vercingetórix'": "'Vercingetórix': 'Vercingetorix'",
    "'Gobierno sirio': 'Gobierno sirio'": "'Gobierno sirio': 'Syrian Government'",
    "'Gobierno sirio y Rusia': 'Gobierno sirio y Russia'": "'Gobierno sirio y Rusia': 'Syrian Government and Russia'",
    "'Husitas (Žižka)': 'Husitas (Žižka)'": "'Husitas (Žižka)': 'Hussites (Žižka)'",
    "'Husitas': 'Husitas'": "'Husitas': 'Hussites'",
    "'Tercios Españoles': 'Tercios Españoles'": "'Tercios Españoles': 'Spanish Tercios'",
    "'Dinastía Jin': 'Dinastía Jin'": "'Dinastía Jin': 'Jin Dynasty'",
    "'Dinastía Tang': 'Dinastía Tang'": "'Dinastía Tang': 'Tang Dynasty'",
    "'Masséna': 'Masséna'": "'Masséna': 'Massena'",
    "'José Bonaparte': 'José Bonaparte'": "'José Bonaparte': 'Joseph Bonaparte'",
    "'Coalición (Blücher)': 'Coalición (Blücher)'": "'Coalición (Blücher)': 'Coalition (Blücher)'",
    "'Blücher (Prusianos)': 'Blücher (Prussianos)'": "'Blücher (Prusianos)': 'Blücher (Prussians)'",
    "'Canadá': 'Canadá'": "'Canadá': 'Canada'",
    "'EEUU, Reino Unido, Canadá y Aliados': 'EEUU, Reino Unido, Canadá y Aliados'":
        "'EEUU, Reino Unido, Canadá y Aliados': 'USA, United Kingdom, Canada and Allies'",
    "'Judíos': 'Judíos'": "'Judíos': 'Jews'",
    "'Judíos del gueto': 'Judíos del gueto'": "'Judíos del gueto': 'Ghetto Jews'",
    "'Rebeldes': 'Rebeldes'": "'Rebeldes': 'Rebels'",
    "'Oposición': 'Oposición'": "'Oposición': 'Opposition'",
    "'oposición': 'oposición'": "'oposición': 'opposition'",
    # Combatant phrases mapped to themselves
    "'Coalición (Blücher) vs Napoleón': 'Coalición (Blücher) vs Napoleón'":
        "'Coalición (Blücher) vs Napoleón': 'Coalition (Blücher) vs Napoleon'",
    "'Napoleón vs Blücher (Prusianos)': 'Napoleón vs Blücher (Prussianos)'":
        "'Napoleón vs Blücher (Prusianos)': 'Napoleon vs Blücher (Prussians)'",
    "'Napoleón vs Wellington / Blücher': 'Napoleón vs Wellington / Blücher'":
        "'Napoleón vs Wellington / Blücher': 'Napoleon vs Wellington / Blücher'",
    "'San Martín vs Realistas': 'San Martín vs Realistas'":
        "'San Martín vs Realistas': 'San Martín vs Royalists'",
    "'Bolívar vs Realistas': 'Bolívar vs Realistas'":
        "'Bolívar vs Realistas': 'Bolívar vs Royalists'",
    "'Wellington vs Masséna': 'Wellington vs Masséna'":
        "'Wellington vs Masséna': 'Wellington vs Massena'",
    "'Wellington vs José Bonaparte': 'Wellington vs José Bonaparte'":
        "'Wellington vs José Bonaparte': 'Wellington vs Joseph Bonaparte'",
}

with open("lib/i18n/translations.ts", encoding="utf-8") as f:
    content = f.read()

count = 0
for old, new in FIXES.items():
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f"  Fixed: {old[:60]}")
    else:
        print(f"  Skip: {old[:60]}")

print(f"\nFixed: {count}/{len(FIXES)}")

with open("lib/i18n/translations.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("File written.")
