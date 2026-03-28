// Script: find all desc values in era files missing from autoTranslateDesc
const fs = require('fs');
const path = require('path');

const eraDir = path.join(__dirname, '../lib/data/eras');
const descFile = path.join(__dirname, '../lib/i18n/descTranslations.ts');
const transFile = path.join(__dirname, '../lib/i18n/translations.ts');

// Extract existing keys from FULL dict
const descContent = fs.readFileSync(descFile, 'utf8');
const fullStart = descContent.indexOf('const FULL = {');
const fullEnd = descContent.indexOf('\n  }', fullStart);
const fullSection = descContent.slice(fullStart, fullEnd + 4);
const existingDescs = new Set();
for (const m of fullSection.matchAll(/'([^']+)':/g)) existingDescs.add(m[1]);

// Extract existing keys from TAG_EN
const transContent = fs.readFileSync(transFile, 'utf8');
const tagStart = transContent.indexOf('const TAG_EN = {');
const tagEnd = transContent.indexOf('\n}', tagStart);
const tagSection = transContent.slice(tagStart, tagEnd + 2);
const existingTags = new Set();
for (const m of tagSection.matchAll(/'([^']+)':/g)) existingTags.add(m[1]);

// Extract all desc and tag values from era files
const files = fs.readdirSync(eraDir).filter(f => f.endsWith('.ts'));
const missingDescs = new Set();
const missingTags = new Set();

for (const file of files) {
  const content = fs.readFileSync(path.join(eraDir, file), 'utf8');
  for (const m of content.matchAll(/desc:\s*'([^']+)'/g)) {
    if (!existingDescs.has(m[1])) missingDescs.add(m[1]);
  }
  for (const m of content.matchAll(/tag:\s*'([^']+)'/g)) {
    if (!existingTags.has(m[1])) missingTags.add(m[1]);
  }
}

console.log('MISSING_DESCS_COUNT:', missingDescs.size);
console.log('MISSING_TAGS_COUNT:', missingTags.size);
console.log('MISSING_DESCS:', JSON.stringify([...missingDescs]));
console.log('MISSING_TAGS:', JSON.stringify([...missingTags]));
