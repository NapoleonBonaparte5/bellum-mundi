replacements = {
    "violence intergrupal in the asentamiento more ancient of the Danube":
        "Intergroup violence at the oldest Danubian settlement",

    "the great archivo of Ebla documenta the first tratados of peace and war":
        "The great archive of Ebla documents the first treaties of peace and war",

    "conflicts precedentes at the Empire Acadio — luchas by hegemonia regional":
        "Conflicts preceding the Akkadian Empire — struggle for regional hegemony",

    "collapse violento of the mundo of the Bronce ancient — cities destroyed":
        "Violent collapse of the Early Bronze Age world — cities destroyed",

    "the invasores of the Zagros destroy the Empire Acadio — end of the first great power":
        "The Zagros invaders destroy the Akkadian Empire — end of the first great power",

    "the Viejo Empire collapses by wars civilians between nomarcas and the power central":
        "The Old Kingdom collapses through civil wars between nomarchs and the central power",

    "first campañas egipcias against the Libu of the West":
        "First Egyptian campaigns against the Libyan tribes of the West",
}

with open("lib/i18n/descTranslations.ts", "r", encoding="utf-8") as f:
    content = f.read()

count = 0
for old, new in replacements.items():
    if f"'{old}'" in content:
        content = content.replace(f"'{old}'", f"'{new}'")
        count += 1
        print(f"  OK: ...{old[:60]}...")
    else:
        print(f"  MISS: {old[:60]}...")

print(f"\nFixed: {count}/{len(replacements)}")

with open("lib/i18n/descTranslations.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("File written.")
