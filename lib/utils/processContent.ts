// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — MARKDOWN → HTML POST-PROCESSOR
// Shared utility used by BattleDetailClient and ChatInterface
// ═══════════════════════════════════════════════════════════

export function processContent(raw: string): string {
  let html = raw

  // PASO 1: Normalizar saltos de línea
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // PASO 2: Convertir headers Markdown
  html = html.replace(/^#{1,2}\s+(.+)$/gm, '\n<h2>$1</h2>\n')
  html = html.replace(/^#{3}\s+(.+)$/gm, '\n<h3>$1</h3>\n')

  // PASO 3: Títulos inline — negrita sola en su línea
  html = html.replace(/\*\*([^*\n]{3,60})\*\*\s*\n/g, '\n<h3>$1</h3>\n')

  // PASO 4: Títulos inline pegados al párrafo
  html = html.replace(/\*\*([^*\n]{3,60})\*\*\s+([A-ZÁÉÍÓÚÑÜ])/g, '</p>\n<h3>$1</h3>\n<p>$2')

  // PASO 5: Negrita/cursiva restante
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>')

  // PASO 6: Convertir párrafos
  const blocks = html.split(/\n{2,}/)
  html = blocks.map(block => {
    block = block.trim()
    if (!block) return ''
    if (block.startsWith('<h') || block.startsWith('<table') ||
        block.startsWith('<figure') || block.startsWith('<div') ||
        block.startsWith('<ul') || block.startsWith('<ol')) return block
    return `<p>${block.replace(/\n/g, ' ')}</p>`
  }).filter(Boolean).join('\n')

  // PASO 7: Limpiar p vacíos y anidados
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>(<h[23]>)/g, '$1')
  html = html.replace(/(<\/h[23]>)<\/p>/g, '$1')

  // Párrafos con datos numéricos
  html = html.replace(/<p>(?=\d)/g, '<p class="num-data">')

  return html
}
