import re, os, unicodedata

era_dir = "lib/data/eras"

def nfc(s):
    return unicodedata.normalize("NFC", s)

# ── 1. Extract COUNTRY_EN correctly (line-by-line) ──
with open("lib/i18n/translations.ts", encoding="utf-8") as f:
    lines = f.readlines()

in_block = False
block_lines = []
start_line = 0
for i, line in enumerate(lines):
    if "const COUNTRY_EN = {" in line:
        in_block = True
        start_line = i
    if in_block:
        block_lines.append(line)
        if i > start_line and line.strip() == "}":
            break

block = "".join(block_lines)
# NFC-normalize all keys and values
country_dict = {nfc(k): nfc(v) for k, v in re.findall(r"'([^']+)':\s*'([^']+)'", block)}
print(f"COUNTRY_EN entries: {len(country_dict)}")

sorted_entries = sorted(country_dict.items(), key=lambda x: -len(x[0]))

# ── 2. Check desc translations ──
all_descs = {}
for fname in os.listdir(era_dir):
    with open(os.path.join(era_dir, fname), encoding="utf-8") as f:
        content = f.read()
    for m in re.findall(r"desc:\s*'([^']*)'", content):
        all_descs[nfc(m)] = fname

with open("lib/i18n/descTranslations.ts", encoding="utf-8") as f:
    dtrans = f.read()
full_start = dtrans.find("const FULL: Record<string, string> = {")
full_block = dtrans[full_start:dtrans.rfind("};")]
dict_items = {nfc(m.group(1)): nfc(m.group(2))
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'", full_block)}

bad_markers = ["evidencias","violento","violenta","eastpas","archivo of","tratados of",
               "invasores of","precedentes at","hegemonia","campanas","collapse violento",
               "Viejo Empire","nomarcas","bronce ancient","asentamiento more"]
desc_errors = 0
for desc, fname in all_descs.items():
    val = dict_items.get(desc)
    if val and any(m in val.lower() for m in bad_markers):
        print(f"CORRUPT DESC [{fname}]: {val[:80]}")
        desc_errors += 1

# ── 3. Check combatants ──
# Proper names that intentionally keep accents in English
INTENTIONAL = {"Bolivar","Blucher","Conde","San Martin","Temuejin",
               "Cortes","Martin","Massena","Zizka","Naguib"}

combatant_errors = 0
for fname in sorted(os.listdir(era_dir)):
    with open(os.path.join(era_dir, fname), encoding="utf-8") as f:
        content = f.read()
    for raw_comb in re.findall(r"combatants:\s*'([^']*)'", content):
        comb = nfc(raw_comb)
        translated = comb
        for es, en in sorted_entries:
            translated = translated.replace(es, en)
        if any(c in "áéíóúüñÁÉÍÓÚÜÑ" for c in translated):
            # Strip known intentional accented proper names
            check = unicodedata.normalize("NFD", translated)
            check = "".join(c for c in check if unicodedata.category(c) != "Mn")
            # Still has accentable base chars that were in Spanish? No easy way.
            # Just report it — we'll review.
            print(f"REMAINING [{fname}]: {raw_comb!r}")
            print(f"        -> {translated!r}")
            combatant_errors += 1

total = desc_errors + combatant_errors
print(f"\nDesc errors:      {desc_errors}")
print(f"Combatant errors: {combatant_errors}")
print(f"Total errors:     {total}")
if total == 0:
    print("All translations OK")
