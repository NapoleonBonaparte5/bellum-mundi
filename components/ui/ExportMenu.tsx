'use client'
// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — EXPORT MENU
// Reusable: exports a battle list as Markdown, Anki TSV, or PDF
// ═══════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import type { FlatBattle, Lang } from '@/lib/data/types'
import { translateCombatants, translateYear, getBattleName, autoTranslateDesc, getEraName } from '@/lib/i18n'

interface ExportMenuProps {
  battles: FlatBattle[]
  lang: Lang
  label?: string
}

// ── Markdown export ──────────────────────────────────────────
function exportMarkdown(battles: FlatBattle[], lang: Lang) {
  const isES = lang === 'es'
  const header = isES
    ? `# Batallas — Bellum Mundi\n\n_Exportado el ${new Date().toLocaleDateString('es-ES')} · ${battles.length} batallas_\n\n`
    : `# Battles — Bellum Mundi\n\n_Exported on ${new Date().toLocaleDateString('en-US')} · ${battles.length} battles_\n\n`

  const colYear = isES ? 'Año' : 'Year'
  const colName = isES ? 'Batalla' : 'Battle'
  const colComb = isES ? 'Combatientes' : 'Combatants'
  const colEra  = isES ? 'Era' : 'Era'
  const colDesc = isES ? 'Descripción' : 'Description'

  const tableHeader = `| ${colYear} | ${colName} | ${colComb} | ${colEra} | ${colDesc} |\n| --- | --- | --- | --- | --- |\n`

  const rows = battles.map(b => {
    const year  = translateYear(lang, b.year).replace(/\|/g, '/')
    const name  = getBattleName(lang, b.name).replace(/\|/g, '/')
    const comb  = translateCombatants(lang, b.combatants).replace(/\|/g, '/')
    const era   = getEraName(lang, b.eraId, b.eraName).replace(/\|/g, '/')
    const desc  = autoTranslateDesc(b.desc, lang).replace(/\|/g, '/').slice(0, 100)
    return `| ${year} | ${name} | ${comb} | ${era} | ${desc} |`
  }).join('\n')

  const content = header + tableHeader + rows
  downloadFile(content, `bellummundi-battles-${lang}.md`, 'text/markdown;charset=utf-8')
}

// ── Anki TSV export ──────────────────────────────────────────
function exportAnki(battles: FlatBattle[], lang: Lang) {
  const isES = lang === 'es'
  const lines: string[] = [
    '#separator:Tab',
    '#html:true',
    '#notetype:Basic',
    `#deck:Bellum Mundi — ${isES ? 'Historia Militar' : 'Military History'}`,
    '',
  ]

  for (const b of battles) {
    const name = getBattleName(lang, b.name)
    const year = translateYear(lang, b.year)
    const comb = translateCombatants(lang, b.combatants)
    const era  = getEraName(lang, b.eraId, b.eraName)
    const desc = autoTranslateDesc(b.desc, lang)

    const front = `<b>${name}</b><br><small>${year}</small>`
    const back  = [
      `<b>${isES ? 'Combatientes' : 'Combatants'}:</b> ${comb}`,
      `<b>${isES ? 'Era' : 'Era'}:</b> ${era}`,
      desc ? `<b>${isES ? 'Descripción' : 'Description'}:</b> ${desc}` : '',
    ].filter(Boolean).join('<br>')

    // TSV: escape tabs and newlines inside fields
    lines.push(`${front.replace(/\t/g, ' ')}\t${back.replace(/\t/g, ' ')}`)
  }

  downloadFile(lines.join('\n'), `bellummundi-anki-${lang}.txt`, 'text/plain;charset=utf-8')
}

// ── PDF (print) export ───────────────────────────────────────
function exportPDF(battles: FlatBattle[], lang: Lang) {
  const isES = lang === 'es'

  const rows = battles.map(b => `
    <tr>
      <td>${translateYear(lang, b.year)}</td>
      <td><strong>${getBattleName(lang, b.name)}</strong></td>
      <td>${translateCombatants(lang, b.combatants)}</td>
      <td>${getEraName(lang, b.eraId, b.eraName)}</td>
      <td>${autoTranslateDesc(b.desc, lang).slice(0, 90)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <title>Bellum Mundi — ${isES ? 'Batallas' : 'Battles'}</title>
  <style>
    body { font-family: Georgia, serif; font-size: 11px; color: #1a1a1a; margin: 20px; }
    h1 { font-size: 18px; border-bottom: 2px solid #8B6914; padding-bottom: 6px; margin-bottom: 4px; }
    p.meta { font-size: 10px; color: #666; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #8B6914; color: #fff; padding: 5px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
    td { padding: 4px 8px; border-bottom: 1px solid #ddd; vertical-align: top; font-size: 10px; }
    tr:nth-child(even) td { background: #faf8f4; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>⚔ Bellum Mundi — ${isES ? 'Base de Datos de Batallas' : 'Battle Database'}</h1>
  <p class="meta">${isES ? 'Exportado el' : 'Exported on'} ${new Date().toLocaleDateString(isES ? 'es-ES' : 'en-US')} · ${battles.length} ${isES ? 'batallas' : 'battles'} · bellummundi.com</p>
  <table>
    <thead>
      <tr>
        <th>${isES ? 'Año' : 'Year'}</th>
        <th>${isES ? 'Batalla' : 'Battle'}</th>
        <th>${isES ? 'Combatientes' : 'Combatants'}</th>
        <th>${isES ? 'Era' : 'Era'}</th>
        <th>${isES ? 'Descripción' : 'Description'}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }
}

// ── Utility ───────────────────────────────────────────────────
function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────
export function ExportMenu({ battles, lang, label }: ExportMenuProps) {
  const isES = lang === 'es'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options = [
    {
      id: 'markdown',
      icon: '📄',
      label: 'Markdown (.md)',
      desc: isES ? `Tabla con ${battles.length} batallas` : `Table with ${battles.length} battles`,
      action: () => exportMarkdown(battles, lang),
    },
    {
      id: 'anki',
      icon: '🃏',
      label: 'Anki (.txt)',
      desc: isES ? `${battles.length} tarjetas de estudio` : `${battles.length} study cards`,
      action: () => exportAnki(battles, lang),
    },
    {
      id: 'pdf',
      icon: '🖨️',
      label: 'PDF / Imprimir',
      desc: isES ? 'Abre diálogo de impresión' : 'Opens print dialog',
      action: () => exportPDF(battles, lang),
    },
  ]

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={battles.length === 0}
        className={`font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-4 py-3 border transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
          open
            ? 'border-gold text-gold bg-gold/10'
            : 'border-gold/20 text-smoke hover:border-gold/40 hover:text-mist'
        }`}
      >
        <span>↓</span>
        <span>{label ?? (isES ? 'Exportar' : 'Export')}</span>
        <span className={`transition-transform text-[0.5rem] ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-slate border border-gold/30 shadow-2xl min-w-[220px]">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { opt.action(); setOpen(false) }}
              className="w-full text-left px-4 py-3 hover:bg-gold/10 transition-colors border-b border-gold/10 last:border-0 flex items-start gap-3"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
              <div>
                <div className="font-cinzel text-[0.6rem] tracking-wider text-mist uppercase">{opt.label}</div>
                <div className="font-crimson text-smoke text-[0.72rem] mt-0.5">{opt.desc}</div>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-gold/10">
            <p className="font-cinzel text-[0.45rem] tracking-wider text-smoke/50 uppercase">
              {isES ? `${battles.length} batallas con filtros activos` : `${battles.length} battles with active filters`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
