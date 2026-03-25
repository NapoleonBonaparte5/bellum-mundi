// api/ai-query.js — v3: fotos Wikimedia, libros garantizados, texto completo

async function callAnthropic(prompt) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `Eres el historiador militar más experto del mundo. Escribes en español con estilo académico apasionante y exhaustivo.

ESTRUCTURA OBLIGATORIA — sigue este orden exacto sin saltarte ninguna sección:

SECCIÓN 1 - IMÁGENES (SIEMPRE primera):
Busca 3 términos en inglés relacionados con el tema y ponlos en este HTML exacto. Usa términos simples y conocidos que existan en Wikipedia como Battle_of_Stalingrad, Erwin_Rommel, Tiger_I, Spitfire, Napoleon_Bonaparte, D-Day, etc:
<div class="modal-gallery">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/[LETRA]/[DOLETRAS]/[NOMBRE_ARCHIVO]/400px-[NOMBRE_ARCHIVO]" onerror="this.style.display='none'" alt="imagen 1" style="width:100%;height:160px;object-fit:cover;">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/[LETRA]/[DOLETRAS]/[NOMBRE_ARCHIVO_2]/400px-[NOMBRE_ARCHIVO_2]" onerror="this.style.display='none'" alt="imagen 2" style="width:100%;height:160px;object-fit:cover;">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/[LETRA]/[DOLETRAS]/[NOMBRE_ARCHIVO_3]/400px-[NOMBRE_ARCHIVO_3]" onerror="this.style.display='none'" alt="imagen 3" style="width:100%;height:160px;object-fit:cover;">
</div>

SECCIÓN 2 - <h3>Contexto Histórico</h3>
4 párrafos mínimo con fechas exactas, cifras, nombres, contexto político y geográfico detallado.

SECCIÓN 3 - <h3>Desarrollo de los Hechos</h3>
4 párrafos describiendo la secuencia fase a fase, movimientos de tropas, decisiones tácticas, momentos de inflexión.

SECCIÓN 4 - <h3>Análisis Militar</h3>
3 párrafos sobre tácticas empleadas, errores estratégicos, innovaciones, comparaciones con otras batallas.

SECCIÓN 5 - <h3>Los Protagonistas</h3>
2-3 párrafos sobre comandantes clave, su psicología, decisiones y consecuencias personales.

SECCIÓN 6 - <h3>Consecuencias e Impacto</h3>
3 párrafos sobre impacto inmediato, a medio plazo y legado histórico hasta hoy.

SECCIÓN 7 - <h4>Datos Clave</h4>
Lista ul con exactamente 10 datos numéricos precisos (fechas, bajas, tropas, duración, etc).

SECCIÓN 8 - BIBLIOGRAFÍA (SIEMPRE la última sección, NUNCA omitirla):
3 libros REALES que existen en Amazon España. Usa este HTML exacto:
<div class="books-section">
<div class="books-title">📚 Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE+LIBRO+1&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL DEL LIBRO 1</div><div class="book-author">AUTOR REAL 1</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE+LIBRO+2&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL DEL LIBRO 2</div><div class="book-author">AUTOR REAL 2</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=PALABRAS+CLAVE+LIBRO+3&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">TITULO REAL DEL LIBRO 3</div><div class="book-author">AUTOR REAL 3</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>

REGLAS CRÍTICAS:
- NUNCA termines la respuesta sin la SECCIÓN 8 de bibliografía
- Los libros deben ser REALES y conocidos (Antony Beevor, John Keegan, Stephen Ambrose, etc)
- El tag bellummundi-21 debe aparecer en los 3 enlaces de Amazon
- Escribe con pasión académica y narrativa épica`,
      messages: [{ role: 'user', content: prompt }]
    })
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await callAnthropic(prompt);

      if (!response.ok) {
        const err = await response.json();
        if (err?.error?.type === 'overloaded_error' && attempt < MAX_RETRIES) {
          console.log(`Sobrecarga, reintento ${attempt}/${MAX_RETRIES}...`);
          await new Promise(r => setTimeout(r, 2000 * attempt));
          continue;
        }
        console.error('Anthropic error:', JSON.stringify(err));
        return res.status(500).json({ error: 'Error en la API de IA' });
      }

      const data = await response.json();
      let content = data.content[0].text;

      // Si la respuesta se cortó antes de la bibliografía, añadirla
      if (!content.includes('books-section') && !content.includes('bellummundi-21')) {
        content += `
<div class="books-section">
<div class="books-title">📚 Bibliografía Recomendada</div>
<div class="books-grid">
<a class="book-item" href="https://www.amazon.es/s?k=historia+militar+universal&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">La Segunda Guerra Mundial</div><div class="book-author">Antony Beevor</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=arte+guerra+historia+militar&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">Historia de la Guerra</div><div class="book-author">John Keegan</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
<a class="book-item" href="https://www.amazon.es/s?k=batallas+decisivas+historia&tag=bellummundi-21" target="_blank">
<div class="book-cover">📖</div>
<div><div class="book-title">Las Grandes Batallas de la Historia</div><div class="book-author">Victor Davis Hanson</div><div class="book-affiliate-tag">Ver en Amazon →</div></div>
</a>
</div>
</div>`;
      }

      return res.status(200).json({ content });

    } catch (err) {
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      console.error('AI query failed:', err.message);
      res.status(500).json({ error: 'Servicio temporalmente no disponible. Inténtalo en unos segundos.' });
    }
  }
};


